import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '@app/shared/entities/user.entity';
import { MessageEntity } from '@app/shared/entities/message.entity';

@Entity('conversation')
export class ConversationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];

  @OneToMany(
    () => MessageEntity,
    (messageEntity) => messageEntity.conversation,
  )
  messages: MessageEntity[];

  @UpdateDateColumn()
  lastUpdate: Date;
}