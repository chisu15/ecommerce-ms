import { Module } from '@nestjs/common';
import { StreamsConsumerService } from './streams-consumer/streams-consumer.service';

@Module({
  providers: [StreamsConsumerService]
})
export class StreamsModule {}
