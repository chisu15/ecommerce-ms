import { Test, TestingModule } from '@nestjs/testing';
import { StreamsConsumerService } from './streams-consumer.service';

describe('StreamsConsumerService', () => {
  let service: StreamsConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamsConsumerService],
    }).compile();

    service = module.get<StreamsConsumerService>(StreamsConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
