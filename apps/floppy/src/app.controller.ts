import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard, UserInterceptor, UserRequest } from '@app/shared';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private readonly presenceService: ClientProxy,
  ) {
  }

  @Get()
  async foo() {
    return { foo: 'bar!' };
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('friends/future-friends')
  async getUsers(@Req() req: UserRequest) {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {
        userId: req.user.id,
      },
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('friends/add-friend/:friendId')
  async addFriend(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number,
  ) {
    if (!req.user) {
      throw new BadRequestException();
    }

    return this.authService.send(
      {
        cmd: 'add-friend',
      },
      {
        userId: req.user.id,
        friendId,
      },
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('friends/delete-friend/:friendId')
  async deleteFriend(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number,
  ) {
    if (!req.user) {
      throw new BadRequestException();
    }

    return this.authService.send(
      {
        cmd: 'delete-friend',
      },
      {
        userId: req.user.id,
        friendId,
      },
    );
  }


  @Get('friends/my-friends')
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async getFriends(@Req() req: UserRequest) {
    if (!req.user) {
      throw new BadRequestException();
    }
    return this.authService.send(
      {
        cmd: 'get-friends',
      },
      {
        userId: req.user.id,
      },
    );
  }


  @Post('auth/register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send(
      { cmd: 'register' },
      {
        firstName, lastName, email, password,
      },
    );
  }

  @Post('auth/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send(
      { cmd: 'login' },
      {
        email, password,
      },
    );
  }
}
