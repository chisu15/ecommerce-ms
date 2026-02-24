import { Injectable } from '@nestjs/common'
import axios, { AxiosRequestConfig } from 'axios'

@Injectable()
export class HttpClientService {
  async forward(req: any, baseUrl: string) {
    const url = `${baseUrl}${req.originalUrl}`

    const headers = { ...req.headers }
    delete (headers as any).host
    delete (headers as any)['content-length']

    const config: AxiosRequestConfig = {
      url,
      method: req.method,
      headers,
      data: req.body,
      validateStatus: () => true,
    }

    const res = await axios.request(config)
    return { status: res.status, data: res.data, headers: res.headers }
  }
}
