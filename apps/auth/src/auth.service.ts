import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";

import {Repository} from "typeorm";

import {UserEntity} from "./user.entity";

@Injectable()
export class AuthService {
    constructor(@InjectRepository(UserEntity) private readonly UserRepository: Repository<UserEntity>) {}

    async getUsers(){
        return this.UserRepository.find();
    }

    async postUser(){
        return this.UserRepository.save({
            name: 'Larry'
        });
    }
}
