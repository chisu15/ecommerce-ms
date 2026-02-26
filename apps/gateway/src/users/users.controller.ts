import { All, Controller, Req, Res } from '@nestjs/common'
import type { Response } from 'express'
import { HttpClientService } from '../proxy/http-client/http-client.service'
import { Auth, CurrentUser } from '../auth/auth.decorator'

@Controller('users')
export class UsersController {
  constructor(private readonly http: HttpClientService) {}

  @Auth('ADMIN')
  @All()
  async root(@Req() req, @Res() res: Response, @CurrentUser() user?) {
    console.log('token info:', user)
    if (user) {
      req.headers['x-user-id'] = user.userId
      req.headers['x-user-phone'] = user.phone
      req.headers['x-user-name'] = user.name
      req.headers['x-user-role'] = user.role
    }

    const baseUrl = process.env.USER_BASE_URL || 'http://localhost:3001'
    const r = await this.http.forward(req, baseUrl)

    return res.status(r.status).send(r.data)
  }
  @Auth('ADMIN')
  @All('*')
  async proxy(
    @Req() req,
    @Res() res: Response,
    @CurrentUser() user?,
  ) {
    console.log('token info:', user)
    if (user) {
      req.headers['x-user-id'] = user.userId
      req.headers['x-user-phone'] = user.phone
      req.headers['x-user-name'] = user.name
      req.headers['x-user-role'] = user.role
    }

    const baseUrl = process.env.USER_BASE_URL || 'http://localhost:3001'
    const r = await this.http.forward(req, baseUrl)

    return res.status(r.status).send(r.data)
  }
}
