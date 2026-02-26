import { All, Controller, Req, Res } from '@nestjs/common'
import type { Response } from 'express'
import { HttpClientService } from '../proxy/http-client/http-client.service'
import { CurrentUser } from '../auth/auth.decorator'

@Controller('orders')
export class OrdersController {
  constructor(private readonly http: HttpClientService) {}

  @All()
  async root(@Req() req: any, @Res() res: Response, @CurrentUser() user?: any) {
    if (user) {
      req.headers['x-user-id'] = user.userId
      req.headers['x-user-phone'] = user.phone
      req.headers['x-user-name'] = user.name
      req.headers['x-user-role'] = user.role
    }

    const baseUrl = process.env.ORDER_BASE_URL || 'http://localhost:3003'
    const r = await this.http.forward(req, baseUrl)

    return res.status(r.status).send(r.data)
  }

  @All('*')
  async proxy(
    @Req() req: any,
    @Res() res: Response,
    @CurrentUser() user?: any,
  ) {
    if (user) {
      req.headers['x-user-id'] = user.userId
      req.headers['x-user-phone'] = user.phone
      req.headers['x-user-name'] = user.name
      req.headers['x-user-role'] = user.role
    }

    const baseUrl = process.env.ORDER_BASE_URL || 'http://localhost:3003'
    const r = await this.http.forward(req, baseUrl)

    return res.status(r.status).send(r.data)
  }
}
