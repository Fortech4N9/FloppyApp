import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { NewUserDto } from './dtos/new-user.dto';
import { ExistingUserDto } from './dtos/existing-user.dto';
import {
  UserRepositoryInterface,
  UserEntity,
  UserJwt,
  FriendRequestEntity,
  FriendRequestsRepository,
} from '@app/shared';
import { AuthServiceInterface } from './interfaces/auth.service.interface';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('FriendRequestsRepositoryInterface')
    private readonly friendRequestsRepository: FriendRequestsRepository,
    private readonly jwtService: JwtService,
  ) {
  }

  async getUsers(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneByCondition({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password'],
    });
  }

  async register(newUser: Readonly<NewUserDto>): Promise<UserEntity> {

    const { firstName, lastName, email, password } = newUser;

    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('An account with that email already exists!');
    }

    const hashedPassword = await this.hashPassword(password);

    const savedUser = await this.userRepository.save(
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    );

    delete savedUser.password;

    return savedUser;
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.findByEmail(email);

    const doesUserExist = !!user;

    if (!doesUserExist) {
      return null;
    }

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );
    if (!doesPasswordMatch) {
      return null;
    }

    return user;
  }

  async login(existingUser: Readonly<ExistingUserDto>): Promise<{
    token: string,
    user: UserEntity
  }> {
    const { email, password } = existingUser;

    const user = await this.validateUser(
      email,
      password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const jwt = await this.jwtService.signAsync({ user });

    delete user.password;

    return { token: jwt, user: user };
  }

  async verifyJwt(jwt: string): Promise<{
    user: UserEntity,
    exp: number
  }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }
    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneById(id);
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) {
      return;
    }

    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async addFriend(
    userId: number,
    friendId: number,
  ): Promise<FriendRequestEntity> {
    const creator = await this.findById(userId);
    const receiver = await this.findById(friendId);

    return await this.friendRequestsRepository.save({ creator, receiver });
  }

  async getFriends(userId: number): Promise<FriendRequestEntity[]> {
    const creator = await this.findById(userId);

    return await this.friendRequestsRepository.findWithRelations({
      where: [{ creator }, { receiver: creator }],
      relations: ['creator', 'receiver'],
    });
  }
}
