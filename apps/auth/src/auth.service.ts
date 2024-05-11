import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from './user.entity';
import { NewUserDto } from './dtos/new-user.dto';
import { ExistingUserDto } from './dtos/existing-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {
  }

  async getUsers() {
    return this.userRepository.find();
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { email: email },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
      ],
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

  async login(existingUser: Readonly<ExistingUserDto>) {
    const { email, password } = existingUser;

    const user = await this.validateUser(
      email,
      password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const jwt = await this.jwtService.signAsync({ user });

    return { token: jwt };
  }

  async verifyJwt(jwt: string): Promise<{ exp: number }> {
    console.log('verifyJwt authService');
    if (!jwt) {
      throw new UnauthorizedException();
    }
    console.log('verifyJwt authService');
    try {
      const { exp } = await this.jwtService.verifyAsync(jwt);
      console.log('verifyJwt authService verifyAsync pass');
      return { exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}