import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OutboxEvent } from './outbox-event.entity'
import { OutboxPublisherService } from './outbox-publisher/outbox-publisher.service'

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent])],
  providers: [OutboxPublisherService],
  exports: [TypeOrmModule],
})
export class OutboxModule {}
