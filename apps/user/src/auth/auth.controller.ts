import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.phone, dto.password)
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Req() req: any) {
    return this.auth.logout(req.user.userId)
  }
}
