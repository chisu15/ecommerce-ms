import { NestFactory } from '@nestjs/core'
import { OrderModule } from './order.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(OrderModule)
  await app.listen(process.env.port ?? 3000)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  console.log(`Order service is running on port ${process.env.port ?? 3000}`)
}
bootstrap()
