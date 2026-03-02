import { All, Controller, Req, Res } from '@nestjs/common'
import type { Response } from 'express'
import { HttpClientService } from '../proxy/http-client/http-client.service'
import { Auth, CurrentUser } from '../auth/auth.decorator'

function attachUserHeaders(req: any, user?: any) {
  if (!user) return
  req.headers['x-user-id'] = user.userId
  req.headers['x-user-phone'] = user.phone
  req.headers['x-user-name'] = user.name
  req.headers['x-user-role'] = user.role
}

@Auth('ADMIN')
@Controller('orders/admin')
export class OrdersAdminController {
  constructor(private readonly http: HttpClientService) {}

  @All()
  async root(@Req() req: any, @Res() res: Response, @CurrentUser() user?: any) {
    console.log('[gateway] /orders/admin', req.method, req.originalUrl, user)
    attachUserHeaders(req, user)

    const baseUrl = process.env.ORDER_BASE_URL || 'http://localhost:3003'
    const r = await this.http.forward(req, baseUrl)
    return res.status(r.status).send(r.data)
  }

  @All('*path')
  async proxy(
    @Req() req: any,
    @Res() res: Response,
    @CurrentUser() user?: any,
  ) {
    console.log('[gateway] /orders/admin/*', req.method, req.originalUrl, user)
    attachUserHeaders(req, user)

    const baseUrl = process.env.ORDER_BASE_URL || 'http://localhost:3003'
    const r = await this.http.forward(req, baseUrl)
    return res.status(r.status).send(r.data)
  }
}
