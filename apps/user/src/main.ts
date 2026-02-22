import { NestFactory } from '@nestjs/core'
import { UserModule } from './user.module'
import { log } from 'console'

async function bootstrap() {
  const app = await NestFactory.create(UserModule)
  await app.listen(process.env.port ?? 3000)
  log(`User service is running on port ${process.env.port ?? 3000}`)
}
bootstrap()
