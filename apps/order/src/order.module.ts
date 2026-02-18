import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrdersModule } from './orders/orders.module';
import { OutboxModule } from './outbox/outbox.module';
import { StreamsModule } from './streams/streams.module';

@Module({
  imports: [OrdersModule, OutboxModule, StreamsModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
