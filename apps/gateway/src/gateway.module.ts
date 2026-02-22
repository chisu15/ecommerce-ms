import { Module } from '@nestjs/common'
import { GatewayController } from './gateway.controller'
import { GatewayService } from './gateway.service'
import { ProxyModule } from './proxy/proxy.module'
import { UsersController } from './users/users.controller'
import { ProductsController } from './products/products.controller'
import { OrdersController } from './orders/orders.controller'
import { HealthController } from './health/health.controller'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/product/.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProxyModule,
  ],

  controllers: [
    GatewayController,
    UsersController,
    ProductsController,
    OrdersController,
    HealthController,
  ],
  providers: [GatewayService],
})
export class GatewayModule {}
