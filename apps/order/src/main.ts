import { NestFactory } from '@nestjs/core'
import { OrderModule } from './order.module'

async function bootstrap() {
  const app = await NestFactory.create(OrderModule)
  await app.listen(process.env.port ?? 3000)
  console.log(`Order service is running on port ${process.env.port ?? 3000}`)
}
bootstrap()
