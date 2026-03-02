import { Controller, Get, Param, Req, Res } from '@nestjs/common'
import type { Response } from 'express'
import { HttpClientService } from '../proxy/http-client/http-client.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly http: HttpClientService) {}

  @Get()
  async list(@Req() req: any, @Res() res: Response) {
    const baseUrl = process.env.PRODUCT_BASE_URL || 'http://localhost:3002'
    const r = await this.http.forward(req, baseUrl)
    return res.status(r.status).send(r.data)
  }

  @Get(':id')
  async get(@Param('id') _id: string, @Req() req: any, @Res() res: Response) {
    const baseUrl = process.env.PRODUCT_BASE_URL || 'http://localhost:3002'
    const r = await this.http.forward(req, baseUrl)
    return res.status(r.status).send(r.data)
  }
}