import { FriendRequestEntity, UserEntity, UserJwt } from '@app/shared';
import { NewUserDto } from '../dtos/new-user.dto';
import { ExistingUserDto } from '../dtos/existing-user.dto';

export interface AuthServiceInterface {
  getUsers(userId: number): Promise<UserEntity[]>;

  findByEmail(password: string): Promise<UserEntity>;

  hashPassword(password: string): Promise<string>;

  findByEmail(email: string): Promise<UserEntity>;

  register(newUser: Readonly<NewUserDto>): Promise<UserEntity>;

  doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean>;

  validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity>;

  login(existingUser: Readonly<ExistingUserDto>): Promise<{
    token: string,
    user: UserEntity
  }>;

  verifyJwt(jwt: string): Promise<{
    user: UserEntity,
    exp: number
  }>

  findById(id: number): Promise<UserEntity>;

  getUserFromHeader(jwt: string): Promise<UserJwt>;

  addFriend(
    userId: number,
    friendId: number,
  ): Promise<FriendRequestEntity>;

  getFriends(userId: number): Promise<FriendRequestEntity[]>;
}
