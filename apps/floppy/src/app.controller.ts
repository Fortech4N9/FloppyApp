import {Controller, Get, Inject} from '@nestjs/common';
import {ClientProxy} from "@nestjs/microservices";

@Controller()
export class AppController {
    constructor(@Inject('AUTH_SERVICE') private authService: ClientProxy) {
    }

    @Get('auth')
    async getUser() {
        return this.authService.send(
            {cmd: 'get-user'},
            {}
        );
    }
}
