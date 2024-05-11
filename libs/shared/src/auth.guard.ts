import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private readonly presenceService: ClientProxy,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

    if (context.getType() !== 'http') {
      return false;
    }

    const authHeader = context.switchToHttp().getRequest()
      .headers['authorization'] as string;

    if (!authHeader) {
      return false;
    }

    const authHeaderParts = authHeader.split(' ');

    if (authHeaderParts.length !== 2) {
      return false;
    }

    const [, jwt] = authHeaderParts;

    return this.authService.send(
      { cmd: 'verify-jwt' },
      { jwt },
    ).pipe(
      switchMap(({ exp }) => {
        if (!exp) {
          return of(false);
        }
        console.log('authGuard pipe');
        const TOKEN_EXP_MS = exp * 1000;

        const isJwtValid = Date.now() < TOKEN_EXP_MS;
        console.log('authGuard TOKEN_EXP_MS');
        console.log(isJwtValid);
        return of(isJwtValid);
      }),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }
}
