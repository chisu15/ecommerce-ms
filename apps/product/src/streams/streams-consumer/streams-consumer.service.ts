import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import Redis from 'ioredis'
import { DataSource } from 'typeorm'
import { StockService } from '../../stock/stock.service'
import { OutboxEvent } from '../../outbox/outbox-event.entity'

type XReadGroupReply = Array<[string, Array<[string, string[]]>]>

@Injectable()
export class StreamsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(StreamsConsumerService.name)
  private redis!: Redis

  private stream!: string
  private group!: string
  private consumer!: string

  constructor(
    private readonly stock: StockService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
    })

    this.stream = process.env.STREAM_CONSUME || '' // stream:order-events
    this.group = process.env.CONSUMER_GROUP || '' // product-service
    this.consumer = process.env.CONSUMER_NAME || 'product-1'

    if (!this.stream || !this.group) return

    try {
      await this.redis.xgroup(
        'CREATE',
        this.stream,
        this.group,
        '$',
        'MKSTREAM',
      )
    } catch (e: any) {
      if (!String(e?.message || e).includes('BUSYGROUP')) throw e
    }

    this.logger.log(
      `Product consumer started. stream=${this.stream} group=${this.group} consumer=${this.consumer}`,
    )

    // ✅ IMPORTANT: chạy loop background, KHÔNG block onModuleInit
    void this.consumeLoop()
  }

  private async consumeLoop() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const reply = (await (this.redis as any).call(
          'XREADGROUP',
          'GROUP',
          this.group,
          this.consumer,
          'BLOCK',
          '2000',
          'COUNT',
          '10',
          'STREAMS',
          this.stream,
          '>',
        )) as XReadGroupReply | null

        if (!reply) continue

        for (const [, messages] of reply) {
          for (const [id, kv] of messages) {
            const fields: Record<string, string> = {}
            for (let i = 0; i < kv.length; i += 2) fields[kv[i]] = kv[i + 1]

            try {
              await this.handle(fields)
              await this.redis.xack(this.stream, this.group, id)
            } catch (err) {
              this.logger.error(`Handle failed msg=${id}`, String(err))
            }
          }
        }
      } catch (err) {
        // tránh loop chết nếu Redis restart
        this.logger.error(`consumeLoop error`, String(err))
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
  }

  private async handle(fields: Record<string, string>) {
    const eventType = fields.eventType
    const payload = JSON.parse(fields.payload || '{}')

    if (eventType !== 'OrderCreated') return

    const orderId = payload.orderId as string
    const items = payload.items as Array<{ productId: string; qty: number }>

    const result = await this.stock.reserve(orderId, items)

    await this.dataSource.transaction(async (manager) => {
      const ev = manager.create(OutboxEvent, {
        aggregateType: 'ORDER',
        aggregateId: orderId,
        eventType: result.ok ? 'StockReserved' : 'StockReserveFailed',
        payload: result.ok
          ? { orderId }
          : { orderId, reason: (result as any).reason || 'UNKNOWN' },
        status: 'PENDING',
        publishedAt: null,
      })
      await manager.save(ev)
    })

    this.logger.log(
      result.ok
        ? `StockReserved order=${orderId}`
        : `StockReserveFailed order=${orderId}`,
    )
  }
}
