import { Module } from '@nestjs/common';
import { OutboxPublisherService } from './outbox-publisher/outbox-publisher.service';

@Module({
  providers: [OutboxPublisherService]
})
export class OutboxModule {}
