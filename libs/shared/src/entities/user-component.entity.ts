import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '@app/shared';
import { Component } from './component.entity';

@Entity()
export class UserComponent {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.userComponents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => Component, (component) => component.userComponents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'component_id' })
    component: Component;

    @Column()
    sortOrder: number;
}