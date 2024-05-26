import {Controller, Get, Param, Post, Req, UseGuards, UseInterceptors} from '@nestjs/common';
import { ChatService } from './chat.service';
import {AuthGuard, UserInterceptor, UserRequest} from "@app/shared";

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getHello(): string {
    return this.chatService.getHello();
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('chat/get-messages/:friendId')
  async getMessages(
      @Req() req: UserRequest,
      @Param('friendId') friendId: number
  ) {
    return this.chatService.getMessages(req.user.id, friendId);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('chat/get-conversation/:friendId')
  async getConversation(
      @Req() req: UserRequest,
      @Param('friendId') friendId: number
  ) {
    return this.chatService.getConservation(req.user.id, friendId);
  }
}
