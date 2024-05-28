import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserComponent } from './user-component.entity';

@Entity()
export class Component {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column()
    html: string;

    @OneToMany(() => UserComponent, (userComponent) => userComponent.component)
    userComponents: UserComponent[];
}