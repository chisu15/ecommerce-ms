import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { User } from '../users/user.entity'
// import process from 'process'

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(input: { phone: string; name: string; password: string }) {
    const user = await this.users.createWithPassword(input)
    const tokens = await this.issueTokens(user)
    await this.users.setRefreshTokenHash(user.id, tokens.refreshToken)
    return { user: this.safeUser(user), ...tokens }
  }

  async login(phone: string, password: string) {
    const user = await this.users.validatePassword(phone, password)
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const tokens = await this.issueTokens(user)
    await this.users.setRefreshTokenHash(user.id, tokens.refreshToken)
    return { user: this.safeUser(user), ...tokens }
  }

  async refresh(refreshToken: string) {
    let payload: any
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid token type')
    }

    const user = await this.users.validateRefreshToken(
      payload.sub,
      refreshToken,
    )
    if (!user) throw new UnauthorizedException('Invalid refresh token')

    const tokens = await this.issueTokens(user)
    await this.users.setRefreshTokenHash(user.id, tokens.refreshToken)
    return { user: this.safeUser(user), ...tokens }
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null)
    return { ok: true }
  }

  private async issueTokens(user: User) {
    const accessPayload = {
      sub: user.id,
      phone: user.phone,
      name: user.name,
      tokenType: 'access',
    }

    const refreshPayload = {
      sub: user.id,
      tokenType: 'refresh',
    }

    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET!,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    })

    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    })

    return { accessToken, refreshToken }
  }

  private safeUser(user: User) {
    return { id: user.id, phone: user.phone, name: user.name }
  }
}
