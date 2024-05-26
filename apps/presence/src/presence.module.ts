import { Module } from '@nestjs/common';
import { RedisModule, SharedModule } from '@app/shared';
import { PresenceGateway } from './presence.gateway';
import { PresenceService } from './presence.service';
import { PresenceController } from './presence.controller';

@Module({
  imports: [
    SharedModule.registerRmq(
      'AUTH_SERVICE',
      process.env.RABBITMQ_AUTH_QUEUE,
    ),
    RedisModule,
  ],
  controllers: [PresenceController],
  providers: [PresenceService, PresenceGateway],
})
export class PresenceModule {
}
