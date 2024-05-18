import { Controller, UseInterceptors } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';

import { PresenceService } from './presence.service';

import { SharedService, RedisService } from '@app/shared';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly sharedService: SharedService,
    private readonly redisService: RedisService,
  ) {
  }

  @MessagePattern({ cmd: 'get-presence' })
  @UseInterceptors(CacheInterceptor)
  async getPresence(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    const foo = await this.redisService.get('foo');
    if (foo) {
      console.log('CACHED');
      return foo;
    }

    const f = this.presenceService.getFoo();
    await this.redisService.set('foo', f);
    return f;
  }
}
