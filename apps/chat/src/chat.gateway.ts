import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RedisCacheService, UserJwt } from '@app/shared';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { firstValueFrom } from 'rxjs';
import { NewMessageDto } from './dtos/NewMessage.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private readonly presenceService: ClientProxy,
    private readonly cache: RedisCacheService,
    private readonly chatService: ChatService,
  ) {
  }

  @WebSocketServer()
  server: Server;

  async handleDisconnect(socket: Socket) {
    console.log('HANDLE DISCONNECT - CONVO');
  }

  async handleConnection(socket: Socket) {
    console.log('HANDLE CONNECTION - CONVO');

    const jwtBearer = socket.handshake.headers.authorization ?? null;
    if (!jwtBearer) {
      this.handleDisconnect(socket);
      return;
    }


    const [, jwt] = jwtBearer.split(' ');


    const ob$ = this.authService.send<UserJwt>(
      { cmd: 'decode-jwt' },
      { jwt },
    );

    const res = await firstValueFrom(ob$)
      .catch((err) => console.error(err));

    if (!res || !res?.user) {
      this.handleDisconnect(socket);
      return;
    }

    const { user } = res;

    socket.data.user = user;

    await this.setConversationUser(socket);

    await this.createConversations(socket, user.id);

    await this.getConversations(socket);
  }

  private async createConversations(socket: Socket, userId: number) {
    const ob2$ = this.authService.send(
      {
        cmd: 'get-friends-list',
      },
      {
        userId,
      });

    const friends = await firstValueFrom(ob2$).catch((err) => console.error(err));

    for (const friend of friends) {
      await this.chatService.createConversation(userId, friend.id);
    }
  }

  private async setConversationUser(socket: Socket) {
    const user = socket.data?.user;

    if (!user || !user.id) {
      return;
    }

    const conversationUser = {
      id: user.id,
      socketId: socket.id,
    };

    await this.cache.set(`conversationUser ${user.id}`, conversationUser);
  }

  private async getFriendDetails(id: number) {
    const ob$ = this.presenceService.send(
        {
          cmd: 'get-active-user',
        },
        { id },
    );

    const activeFriend = await firstValueFrom(ob$).catch((err) =>
        console.error(err),
    );

    if (!activeFriend) return;

    const friendsDetails = (await this.cache.get(
        `conversationUser ${activeFriend.id}`,
    )) as { id: number; socketId: string } | undefined;

    return friendsDetails;
  }

  @SubscribeMessage('getConversations')
  async getConversations(socket: Socket) {
    const { user } = socket.data;

    if (!user) {
      return;
    }

    const conversations = await
      this.chatService.getConversations(user.id);

    this.server.to(socket.id).emit('getAllConversations', conversations);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(socket: Socket, newMessage: NewMessageDto) {
    if (!newMessage) return;



    const { user } = socket.data;

    console.log(user)

    if (!user) {
      return;
    }

    const createdMessage = await this.chatService.createMessage(
      user.id,
      newMessage,
    );


    const ob$ = this.presenceService.send(
      {
        cmd: 'get-active-user',
      },
      {
        id: newMessage.friendId,
      },
    );

    const activeFriend = await firstValueFrom(ob$)
      .catch((err) => console.error(err));


    if (!activeFriend || !activeFriend.isActive) {
      return;
    }

    const friendsDetails = (await this.cache.get(
      `conversationUser ${newMessage.friendId}`,
    )) as { id: number; socketId: string } | undefined;

    if (!friendsDetails) {
      return;
    }

    const {
      id,
      message,
      user: creator,
      conversation,
    } = createdMessage;

    this.server.to(friendsDetails.socketId).emit('newMessage', {
      id,
      message,
      creatorId: creator.id,
      conversationId: conversation.id,
    });
  }
}