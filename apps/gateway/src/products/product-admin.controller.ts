import { All, Controller, Req, Res } from '@nestjs/common'
import type { Response } from 'express'
import { HttpClientService } from '../proxy/http-client/http-client.service'
import { Auth } from '../auth/auth.decorator'
import { CurrentUser } from '../auth/auth.decorator'

function attachUserHeaders(req: any, user?: any) {
  if (!user) return
  req.headers['x-user-id'] = user.userId
  req.headers['x-user-phone'] = user.phone
  req.headers['x-user-name'] = user.name
  req.headers['x-user-role'] = user.role
}

@Auth('ADMIN')
@Controller()
export class ProductsAdminController {
  constructor(private readonly http: HttpClientService) {}

  @All(['products', 'products/*', 'stock', 'stock/*'])
  async proxy(
    @Req() req: any,
    @Res() res: Response,
    @CurrentUser() user?: any,
  ) {
    attachUserHeaders(req, user)

    const baseUrl = process.env.PRODUCT_BASE_URL || 'http://localhost:3002'
    const r = await this.http.forward(req, baseUrl)
    return res.status(r.status).send(r.data)
  }
}
