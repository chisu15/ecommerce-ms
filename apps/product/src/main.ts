import { NestFactory } from '@nestjs/core'
import { ProductModule } from './product.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(ProductModule)
  await app.listen(process.env.port ?? 3000)
  console.log(`Product service is running on port ${process.env.port ?? 3000}`)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
}
bootstrap()
