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
import { count } from 'rxjs';

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

  async getUsers(userId: number): Promise<UserEntity[]> {
    const allUsers = await this.userRepository.findAll();
    const friendsRelationship = await this.getFriends(userId);

    const users = allUsers.filter(user => {
      return user.id !== userId && !friendsRelationship.some(relationship => relationship.receiver.id === user.id);
    });

    return users;
  }

  async getUserById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneById(id);
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

  async deleteFriend(
    userId: number,
    friendId: number,
  ): Promise<{ message: string }> {
    try {
      const creator = await this.findById(userId);
      const receiver = await this.findById(friendId);

      console.log(creator);
      console.log(receiver);

      if (!creator || !receiver) {
        throw new Error('User not found');
      }

      await this.removeFriendRequest(creator, receiver);

      await this.removeFriendRequest(receiver, creator);

      console.log('coolDelete');
      return { message: 'Delete confirm' };
    } catch (error) {
      console.error('Error deleting friend request:', error);
      throw error;
    }
  }

  private async removeFriendRequest(creator: UserEntity, receiver: UserEntity) {
    const requests = await this.friendRequestsRepository.findWithRelations({
      where: [{ creator, receiver }, { creator: creator, receiver: receiver }],
      relations: ['creator', 'receiver'],
    });
    console.log(requests);
    if (requests) {
      await Promise.all(requests.map((request) => this.friendRequestsRepository.remove(request)));
    }
  }

  async getFriends(userId: number): Promise<FriendRequestEntity[]> {
    const creator = await this.findById(userId);

    return await this.friendRequestsRepository.findWithRelations({
      where: [{ creator }, { receiver: creator }],
      relations: ['creator', 'receiver'],
    });
  }

  async getFriendsList(userId: number) {
    const friendRequests = await this.getFriends(userId);

    if (!friendRequests) {
      return [];
    }

    const friends = friendRequests.map((friendRequest) => {
      const isUserCreator = userId === friendRequest.creator.id;

      const friendDetails = isUserCreator
        ? friendRequest.receiver
        : friendRequest.creator;

      const { id, firstName, lastName, email } = friendDetails;

      return {
        id,
        firstName,
        lastName,
        email,
      };
    });

    return friends;
  }
}
