import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt.strategy'
import { AuthController } from './auth.controller'
import { ProxyModule } from '../proxy/proxy.module'

@Module({
  imports: [PassportModule, ProxyModule],
  providers: [JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
