import * as dotenv from 'dotenv'
dotenv.config({ path: 'apps/gateway/.env' })

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { GatewayModule } from './gateway.module'

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const port = Number(process.env.PORT || 3000)
  await app.listen(port)
  console.log(`[gateway] is running on http://localhost:${port}`)
}
bootstrap()
