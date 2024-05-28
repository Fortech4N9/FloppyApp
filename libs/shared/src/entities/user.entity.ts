import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FriendRequestEntity } from '@app/shared/entities/friend-request.entity';
import { ConversationEntity } from '@app/shared/entities/conversation.entity';
import { MessageEntity } from '@app/shared/entities/message.entity';
import {UserComponent} from "@app/shared/entities/user-component.entity";

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @OneToMany(
    () => FriendRequestEntity,
    (FriendRequestEntity) =>
      FriendRequestEntity.creator,
  )
  friendRequestCreator: FriendRequestEntity[];

  @OneToMany(() => FriendRequestEntity,
    (FriendRequestEntity) =>
      FriendRequestEntity.receiver,
  )
  friendRequestReceiver: FriendRequestEntity[];

  @ManyToMany(
    () => ConversationEntity,
    (conversationEntity) => conversationEntity.users,
  )
  conversations: ConversationEntity[];

  @OneToMany(
    () => MessageEntity,
    (messageEntity) => messageEntity.user,
  )
  messages: MessageEntity[];

  @OneToMany(() => UserComponent, (userComponent) => userComponent.user)
  userComponents: UserComponent[];
}