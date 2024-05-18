import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  getFoo(): { foo: string } {
    console.log('NOT CACHED!');

    return { foo: 'bar' };
  }
}
