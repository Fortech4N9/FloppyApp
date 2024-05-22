import { BaseAbstractRepository } from '@app/shared';
import { MessageEntity } from '@app/shared/entities/message.entity';
import { MessagesRepositoryInterface } from '@app/shared/interfaces/messages.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesRepository extends BaseAbstractRepository<MessageEntity> implements MessagesRepositoryInterface{
  constructor(
    @InjectRepository(MessageEntity)
    private readonly MessageEntity: Repository<MessageEntity>,
  ) {
    super(MessageEntity);
  }
}