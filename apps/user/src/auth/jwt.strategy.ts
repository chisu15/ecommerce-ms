import { AccessTokenPayload, JwtUser } from '@app/common'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || '',
    })
  }

  validate(payload: AccessTokenPayload): JwtUser {
    return {
      userId: payload.sub,
      phone: payload.phone,
      name: payload.name,
      role: payload.role,
      tokenType: payload.tokenType,
    }
  }
}
