import { BaseInterfaceRepository } from '@app/shared/repositories/base/base.interface.repository';
import { ConversationEntity } from '@app/shared/entities/conversation.entity';

export interface ConversationsRepositoryInterface extends BaseInterfaceRepository<ConversationEntity> {
  findConversation(
    userId: number,
    friendId: number,
  ): Promise<ConversationEntity | undefined>;
}