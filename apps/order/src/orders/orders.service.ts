/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Order } from './order.entity'
import { OrderItem } from './order-item.entity'
import { OutboxEvent } from '../outbox/outbox-event.entity'

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}
  async create(body: {
    customerId: string
    customerName: string
    customerPhone: string
    items: Array<{
      productId: string
      productName: string
      unitPrice: string
      qty: number
    }>
  }) {
    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        customerId: body.customerId,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        status: 'PENDING',
      })

      order.items = body.items.map((it) =>
        manager.create(OrderItem, {
          productId: it.productId,
          productNameSnapshot: it.productName,
          unitPriceSnapshot: it.unitPrice,
          qty: it.qty,
          lineTotal: (Number(it.unitPrice) * it.qty).toString(),
        }),
      )

      const total = order.items.reduce<number>(
        (sum, item) => sum + Number(item.lineTotal),
        0,
      )
      order.totalAmount = total.toString()

      const saved = await manager.save(order)

      const outbox = manager.create(OutboxEvent, {
        aggregateType: 'ORDER',
        aggregateId: saved.id,
        eventType: 'OrderCreated',
        payload: {
          orderId: saved.id,
          customerId: saved.customerId,
          customerName: saved.customerName,
          customerPhone: saved.customerPhone,
          items: saved.items.map((i) => ({
            productId: i.productId,
            qty: i.qty,
          })),
        },
        status: 'PENDING',
        publishedAt: null,
      })
      await manager.save(outbox)

      return saved
    })
  }

  async get(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: true },
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async list(filter: {
    phone?: string
    name?: string
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    from?: string
    to?: string
    page?: number
    limit?: number
  }) {
    const page = Math.max(1, Number(filter.page || 1))
    const limit = Math.min(100, Math.max(1, Number(filter.limit || 10)))
    const skip = (page - 1) * limit

    const qb = this.orderRepo.createQueryBuilder('o')

    if (filter.phone)
      qb.andWhere('o.customerPhone = :phone', { phone: filter.phone })
    if (filter.name)
      qb.andWhere('o.customerName ILIKE :name', { name: `%${filter.name}%` })
    if (filter.status)
      qb.andWhere('o.status = :status', { status: filter.status })

    if (filter.from)
      qb.andWhere('o.createdAt >= :from', { from: `${filter.from} 00:00:00` })
    if (filter.to)
      qb.andWhere('o.createdAt <= :to', { to: `${filter.to} 23:59:59` })

    qb.orderBy('o.createdAt', 'DESC').skip(skip).take(limit)

    const [data, total] = await qb.getManyAndCount()

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Saga consumer gọi
  async markConfirmed(orderId: string) {
    await this.orderRepo.update({ id: orderId }, { status: 'CONFIRMED' })
  }

  async markCancelled(orderId: string) {
    await this.orderRepo.update({ id: orderId }, { status: 'CANCELLED' })
  }

  // Admin endpoints (demo/ops)
  async confirmAdmin(orderId: string) {
    const o = await this.orderRepo.findOne({ where: { id: orderId } })
    if (!o) throw new NotFoundException('Order not found')
    o.status = 'CONFIRMED'
    return this.orderRepo.save(o)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async cancelAdmin(orderId: string, reason?: string) {
    const o = await this.orderRepo.findOne({ where: { id: orderId } })
    if (!o) throw new NotFoundException('Order not found')
    o.status = 'CANCELLED'
    return this.orderRepo.save(o)
  }

  async reportDaily(from: string, to: string) {
    const rows = await this.orderRepo.query(
      `
      SELECT
        DATE(o.created_at) AS day,
        COUNT(*)::int AS orders,
        SUM(o.total_amount::numeric)::text AS revenue
      FROM orders o
      WHERE o.status = 'CONFIRMED'
        AND o.created_at >= $1::date
        AND o.created_at <= ($2::date + INTERVAL '1 day' - INTERVAL '1 second')
      GROUP BY DATE(o.created_at)
      ORDER BY day ASC
      `,
      [from, to],
    )
    return rows
  }
}
