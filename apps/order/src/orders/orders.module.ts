import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { Order } from './order.entity'
import { OrderItem } from './order-item.entity'
import { ProductsClient } from '../products/products.client'

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrdersController],
  providers: [OrdersService, ProductsClient],
  exports: [OrdersService],
})
export class OrdersModule {}
