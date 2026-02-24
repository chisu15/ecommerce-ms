import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

import { AuthModule } from './auth/auth.module'
import { AccessTokenGuard } from './auth/guards/access-token.guard'
import { ProxyModule } from './proxy/proxy.module'

import { HealthController } from './health/health.controller'
import { ProductsController } from './products/products.controller'
import { OrdersController } from './orders/orders.controller'
import { UsersController } from './users/users.controller'
import { AuthController } from './auth/auth.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/gateway/.env',
    }),
    ProxyModule,
    AuthModule,
  ],
  controllers: [
    HealthController,
    AuthController,
    ProductsController,
    OrdersController,
    UsersController,
  ],
  providers: [{ provide: APP_GUARD, useClass: AccessTokenGuard }],
})
export class GatewayModule {}
