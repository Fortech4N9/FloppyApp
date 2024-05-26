import {BaseAbstractRepository, ConversationEntity} from '@app/shared';
import { MessageEntity } from '@app/shared/entities/message.entity';
import { MessagesRepositoryInterface } from '@app/shared/interfaces/messages.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {FindManyOptions, Repository} from 'typeorm';

@Injectable()
export class MessagesRepository
    extends BaseAbstractRepository<MessageEntity>
    implements MessagesRepositoryInterface{
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageEntity: Repository<MessageEntity>,
  ) {
    super(messageEntity);
  }

  public async findMessagesByConversationId(conversationId: number): Promise<MessageEntity[]> {
    return this.messageEntity
        .createQueryBuilder('messages')
        .leftJoinAndSelect('messages.conversation', 'conversation') // JOIN с таблицей Conversation
        .leftJoinAndSelect('messages.user', 'user')
        .select(['messages', 'conversation.id', 'user.id'])// JOIN с таблицей User
        .where('messages.conversationId = :conversationId', { conversationId })
        .orderBy('messages.createdAt', 'ASC')
        .getMany();
  }
}