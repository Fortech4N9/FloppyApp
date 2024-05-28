import {
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import {AuthGuard, UserInterceptor} from "@app/shared";
import {ComponentDto} from "./dtos/Component.dto";

@Controller()
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('profile/get-profile/:userId')
  async getProfile(@Param('userId') userId: number) {
    return this.componentsService.getUserProfile(userId);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('profile/set-profile/:userId')
  async setProfile(
      @Req() req,
      @Param('userId') userId: number
  ) {
    return this.componentsService.setProfile(userId, JSON.parse(req.body.data));
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('profile/get-unused-components/:userId')
  async getUnusedComponents(@Param('userId') userId: number){
    return this.componentsService.getUnusedComponents(userId);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('profile/get-user/:userId')
  async getUser(@Param('userId') userId: number) {
    return this.componentsService.getUser(userId);
  }
}
