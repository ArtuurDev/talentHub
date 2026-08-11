import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../env';

interface UserPayload {
  sub: string
  sessionId: string
  roles: string[]
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
      const configService = new ConfigService<Env, true>()
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: configService.get("JWT_SECRET"),
        ignoreExpiration: false,
        algorithms: ['HS256'],
      })
  }

  async validate(payload: UserPayload): Promise<{id: string, sessionId: string, roles: string[]}> {
    return { 
      id: payload.sub,
      sessionId: payload.sessionId,
      roles: payload.roles
    }
  }
}
