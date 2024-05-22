import { BaseInterfaceRepository } from '@app/shared/repositories/base/base.interface.repository';
import { MessageEntity } from '@app/shared/entities/message.entity';

export interface MessagesRepositoryInterface extends BaseInterfaceRepository<MessageEntity> {

}