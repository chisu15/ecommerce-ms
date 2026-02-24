import { NestFactory } from '@nestjs/core'
import { UserModule } from './user.module'
import { log } from 'console'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(UserModule)
  await app.listen(process.env.port ?? 3000)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  log(`User service is running on port ${process.env.port ?? 3000}`)
}
bootstrap()
