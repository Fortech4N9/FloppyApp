import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';

import { PresenceService } from './presence.service';

import { SharedService} from '@app/shared';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly sharedService: SharedService,
  ) {
  }

  @MessagePattern({ cmd: 'get-presence' })
  async getPresence(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    return this.presenceService.getHello();
  }
}
