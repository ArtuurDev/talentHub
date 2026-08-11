import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from '@nestjs/core';
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from '../../common/decorators/public';

interface JwtValidationInfo {
  name?: string
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }

  handleRequest<TUser>(
    error: unknown,
    user: TUser | false | null,
    info?: JwtValidationInfo,
  ): TUser {
    // O Passport usa `info` para informar falhas esperadas de autenticação.
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token de acesso expirado')
    }

    if (error || !user) {
      throw new UnauthorizedException('Token de acesso inválido ou ausente')
    }

    return user
  }
}
