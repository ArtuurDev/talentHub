import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../env';
import { Request } from 'express';

interface UserPayload {
  sub: string
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
      const configService = new ConfigService<Env, true>()
      super({
        jwtFromRequest: refreshTokenExtractor,
        secretOrKey: configService.get("JWT_SECRET"),
        algorithms: ['HS256'],
        ignoreExpiration: false,
        passReqToCallback: true
      })
  }

  async validate(request: Request, payload: UserPayload): Promise<{id: string, refresh_token: string}> {
    return { 
      id: payload.sub,
      refresh_token: request.cookies.refresh_token
    }
  }
}


export function refreshTokenExtractor(
  request: Request,
): string | null {
  if (!request?.cookies) {
    return null
  }

  return request.cookies.refresh_token ?? null
}