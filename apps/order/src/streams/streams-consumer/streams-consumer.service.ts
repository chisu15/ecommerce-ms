import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import Redis from 'ioredis'
import { OrdersService } from '../../orders/orders.service'

type XReadGroupReply = Array<[string, Array<[string, string[]]>]>

@Injectable()
export class StreamsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(StreamsConsumerService.name)
  private redis!: Redis

  private stream!: string
  private group!: string
  private consumer!: string

  constructor(private readonly orders: OrdersService) {}

  async onModuleInit() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
    })

    this.stream = process.env.STREAM_CONSUME || '' // stream:product-events
    this.group = process.env.CONSUMER_GROUP || '' // order-service
    this.consumer = process.env.CONSUMER_NAME || 'order-1'

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
      `Order consumer started. stream=${this.stream} group=${this.group} consumer=${this.consumer}`,
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
        this.logger.error(`consumeLoop error`, String(err))
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
  }

  private async handle(fields: Record<string, string>) {
    const eventType = fields.eventType
    const payload = JSON.parse(fields.payload || '{}')

    if (eventType === 'StockReserved') {
      await this.orders.markConfirmed(payload.orderId)
      this.logger.log(`Order CONFIRMED: ${payload.orderId}`)
      return
    }

    if (eventType === 'StockReserveFailed') {
      await this.orders.markCancelled(payload.orderId)
      this.logger.log(
        `Order CANCELLED: ${payload.orderId} reason=${payload.reason || ''}`,
      )
      return
    }
  }
}
