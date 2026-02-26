import { All, Controller, Req, Res } from '@nestjs/common'
import type { Response } from 'express'

import { HttpClientService } from '../proxy/http-client/http-client.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly http: HttpClientService) {}

  @All('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    const baseUrl = process.env.USER_BASE_URL || 'http://localhost:3001'
    const r = await this.http.forward(req, baseUrl)
    return res.status(r.status).send(r.data)
  }
}
