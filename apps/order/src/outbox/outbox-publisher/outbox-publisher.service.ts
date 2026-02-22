import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Redis from 'ioredis'
import { Repository } from 'typeorm'
import { OutboxEvent } from '../outbox-event.entity'

@Injectable()
export class OutboxPublisherService implements OnModuleInit {
  private readonly logger = new Logger(OutboxPublisherService.name)
  private redis!: Redis

  constructor(
    @InjectRepository(OutboxEvent) private repo: Repository<OutboxEvent>,
  ) {}

  onModuleInit() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
    })

    setInterval(() => void this.publishBatch(), 500)
  }

  private async publishBatch() {
    const stream = process.env.STREAM_OUTBOX_TARGET
    if (!stream) return

    const events = await this.repo.find({
      where: { status: 'PENDING' },
      order: { createdAt: 'ASC' },
      take: 50,
    })

    for (const ev of events) {
      try {
        await this.redis.xadd(
          stream,
          '*',
          'eventType',
          ev.eventType,
          'aggregateType',
          ev.aggregateType,
          'aggregateId',
          ev.aggregateId,
          'payload',
          JSON.stringify(ev.payload),
        )

        ev.status = 'PUBLISHED'
        ev.publishedAt = new Date()
        await this.repo.save(ev)
      } catch (e) {
        ev.status = 'FAILED'
        await this.repo.save(ev)
        this.logger.error(`Publish failed: ${ev.id}`, String(e))
      }
    }
  }
}
