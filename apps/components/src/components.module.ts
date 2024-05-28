import { Module } from '@nestjs/common';
import { ComponentsController } from './components.controller';
import { ComponentsService } from './components.service';
import {
  Component, ComponentsRepository,
  ConversationEntity,
  FriendRequestEntity,
  MessageEntity,
  PostgresDBModule,
  SharedModule, UserComponent, UserComponentsRepository,
  UserEntity
} from "@app/shared";
import * as process from "node:process";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [
      PostgresDBModule,
      SharedModule.registerRmq(
          'AUTH_SERVICE',
          process.env.RABBITMQ_AUTH_QUEUE
      ),
    SharedModule.registerRmq(
        'PRESENCE_SERVICE',
        process.env.RABBITMQ_PRESENCE_QUEUE
    ),
    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      ConversationEntity,
      MessageEntity,
      Component,
      UserComponent,
    ]),
  ],
  controllers: [ComponentsController],
  providers: [
      ComponentsService,
    {
      provide: 'ComponentsRepositoryInterface',
      useClass: ComponentsRepository,
    },
    {
      provide: 'UserComponentsRepositoryInterface',
      useClass: UserComponentsRepository,
    }
  ],
})
export class ComponentsModule {}
