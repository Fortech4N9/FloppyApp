import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '@app/shared';
import { ActiveUser } from './interfaces/ActiveUser.interface';

@Injectable()
export class PresenceService {
  constructor(private readonly cache: RedisCacheService) {
  }

  getFoo(): { foo: string } {
    console.log('NOT CACHED!');

    return { foo: 'bar' };
  }

  async getActiveUser(id: number) {
    console.log(id)
    const user = await this.cache.get(`user ${id}`);

    return user as ActiveUser | undefined;
  }
}
