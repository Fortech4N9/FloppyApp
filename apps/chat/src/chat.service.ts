import {Inject, Injectable} from '@nestjs/common';
import {ConversationsRepositoryInterface, MessagesRepositoryInterface, UserEntity,} from '@app/shared';
import {ClientProxy} from '@nestjs/microservices';
import {firstValueFrom} from 'rxjs';
import {NewMessageDto} from './dtos/NewMessage.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('ConversationsRepositoryInterface')
    private readonly conversationsRepository: ConversationsRepositoryInterface,
    @Inject('MessagesRepositoryInterface')
    private readonly messagesRepository: MessagesRepositoryInterface,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {
  }

  getHello(): string {
    return 'Hello World!';
  }

  private async getUser(id: number) {
    const ob$ = this.authService.send<UserEntity>
    (
      { cmd: 'get-user' },
      { id },
    );

    const user = await firstValueFrom(ob$)
      .catch((err) => console.error(err));

    return user;
  }

  async getMessages(userId: number, friendId: number) {
    const conversation = await this.conversationsRepository.findConversation(userId, friendId);
    if (!conversation) {
      return [];
    }
    return this.messagesRepository.findMessagesByConversationId(conversation.id);
  }

  async getConservation(userId: number, friendId: number){
    return await this.conversationsRepository.findConversation(userId, friendId);
  }

  async getConversations(userId: number) {
    const allConversations = await
      this.conversationsRepository.findWithRelations({
        relations: ['users'],
      });

    const userConversations = allConversations.filter((conversation) => {
      const userIds = conversation.users.map((user) => user.id);
      return userIds.includes(userId);
    });

    return userConversations.map((conversation) => ({
      id: conversation.id,
      userIds:
        (conversation?.users ?? []).map((user) => user.id),
    }));
  }

  async createConversation(userId: number, friendId: number) {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);

    if (!user || !friend) {
      return;
    }
    const conversation = await this.conversationsRepository.findConversation(
      userId,
      friendId,
    );

    if (!conversation) {
      return await this.conversationsRepository.save({
        users: [user, friend],
      });
    }

    return conversation;
  }

  async createMessage(userId: number, newMessage: NewMessageDto) {
    const user = await this.getUser(userId);

    if (!user) {
      return;
    }

    const conversation = await this.conversationsRepository.findConversation(
      userId,
      newMessage.friendId,
    );

    if (!conversation) {
      return;
    }

    return await this.messagesRepository.save({
      message: newMessage.message,
      user,
      conversation,
    });
  }
}
