import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SharedModule,
  PostgresDBModule,
  SharedService,
  UsersRepository,
  UserEntity,
  FriendRequestsRepository,
  FriendRequestEntity,
  ConversationEntity,
  MessageEntity, Component, UserComponent,
} from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),

    SharedModule,
    PostgresDBModule,

    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      ConversationEntity,
      MessageEntity,
      Component,
      UserComponent,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    JwtGuard,
    JwtStrategy,
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'FriendRequestsRepositoryInterface',
      useClass: FriendRequestsRepository,
    },
  ],
})
export class AuthModule {
}
