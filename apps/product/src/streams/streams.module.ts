import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StreamsConsumerService } from './streams-consumer/streams-consumer.service'
import { StockModule } from '../stock/stock.module'
import { OutboxEvent } from '../outbox/outbox-event.entity'

@Module({
  imports: [StockModule, TypeOrmModule.forFeature([OutboxEvent])],
  providers: [StreamsConsumerService],
})
export class StreamsModule {}
