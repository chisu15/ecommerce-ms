import { All, Controller, Req, Res } from '@nestjs/common'
import type { Response } from 'express'
import { HttpClientService } from '../proxy/http-client/http-client.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly http: HttpClientService) {}
  @All()
  async root(@Req() req: any, @Res() res: Response) {
    // if (user) {
    //   req.headers['x-user-id'] = user.userId
    // }

    const baseUrl = process.env.PRODUCT_BASE_URL || 'http://localhost:3002'
    const r = await this.http.forward(req, baseUrl)
    return res.status(r.status).send(r.data)
  }
  @All('*')
  async proxy(
    @Req() req: any,
    @Res() res: Response,
    // @CurrentUser() user?: any,
  ) {
    // if (user) {
    //   req.headers['x-user-id'] = user.userId
    // }

    const baseUrl = process.env.PRODUCT_BASE_URL || 'http://localhost:3002'
    const r = await this.http.forward(req, baseUrl)
    return res.status(r.status).send(r.data)
  }
}
