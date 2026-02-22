import { Module } from '@nestjs/common'
import { HttpClientService } from './http-client/http-client.service'

@Module({
  providers: [HttpClientService],
})
export class ProxyModule {}
