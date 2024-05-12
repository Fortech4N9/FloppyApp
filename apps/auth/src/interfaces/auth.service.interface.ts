import { UserEntity } from '@app/shared';
import { NewUserDto } from '../dtos/new-user.dto';
import { ExistingUserDto } from '../dtos/existing-user.dto';

export interface AuthServiceInterface {
  getUsers(): Promise<UserEntity[]>;

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

  login(existingUser: Readonly<ExistingUserDto>): Promise<{ token: string }>;

  verifyJwt(jwt: string): Promise<{ exp: number }>;

}
