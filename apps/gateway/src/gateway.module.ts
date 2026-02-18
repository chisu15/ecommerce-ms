import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ProxyModule } from './proxy/proxy.module';
import { UsersController } from './users/users.controller';
import { ProductsController } from './products/products.controller';
import { OrdersController } from './orders/orders.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ProxyModule],
  controllers: [GatewayController, UsersController, ProductsController, OrdersController, HealthController],
  providers: [GatewayService],
})
export class GatewayModule {}
