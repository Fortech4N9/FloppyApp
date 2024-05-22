import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import {
  ConversationEntity,
  ConversationsRepository,
  FriendRequestEntity,
  MessageEntity,
  MessagesRepository,
  PostgresDBModule,
  RedisModule,
  SharedModule,
  UserEntity,
} from '@app/shared';
import * as process from 'node:process';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    PostgresDBModule,
    RedisModule,
    SharedModule.registerRmq(
      'AUTH_SERVICE',
      process.env.RABBITMQ_AUTH_QUEUE,
    ),
    SharedModule.registerRmq(
      'PRESENCE_SERVICE',
      process.env.RABBITMQ_PRESENCE_QUEUE,
    ),
    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      ConversationEntity,
      MessageEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    {
      provide:
        'ConversationsRepositoryInterface',
      useClass: ConversationsRepository,
    },
    {
      provide:
        'MessagesRepositoryInterface',
      useClass: MessagesRepository,
    },
  ],
})
export class ChatModule {
}
