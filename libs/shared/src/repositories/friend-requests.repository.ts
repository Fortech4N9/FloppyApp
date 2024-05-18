import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequestEntity } from '@app/shared/entities/friend-request.entity';
import { BaseAbstractRepository } from '@app/shared/repositories/base/base.abstract.repository';
import { FriendRequestsRepositoryInterface } from '@app/shared/interfaces/friend-requests.repository.interface';

@Injectable()
export class FriendRequestsRepository
  extends  BaseAbstractRepository<FriendRequestEntity>
  implements FriendRequestsRepositoryInterface{
  constructor(
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestEntity: Repository<FriendRequestEntity>,
  ) {
    super(friendRequestEntity);
  }
}