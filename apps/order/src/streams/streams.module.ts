import { Module } from '@nestjs/common'
import { StreamsConsumerService } from './streams-consumer/streams-consumer.service'
import { OrdersModule } from '../orders/orders.module'

@Module({
  imports: [OrdersModule],
  providers: [StreamsConsumerService],
})
export class StreamsModule {}
