import { Injectable } from '@nestjs/common'
import axios, { AxiosRequestConfig } from 'axios'

@Injectable()
export class HttpClientService {
  async forward(req, baseUrl): Promise<{ status: number; data; headers}> {
    const url = `${baseUrl}${req.originalUrl}`

    const headers = { ...req.headers }
    delete (headers).host
    delete (headers)['content-length']

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
