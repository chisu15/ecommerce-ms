import { Injectable } from '@nestjs/common'
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

      // Outbox: OrderCreated
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

  findById(id: string) {
    return this.orderRepo.findOne({ where: { id }, relations: { items: true } })
  }

  findByPhone(phone: string) {
    return this.orderRepo.find({
      where: { customerPhone: phone },
      order: { createdAt: 'DESC' },
    })
  }

  async markConfirmed(orderId: string) {
    await this.orderRepo.update({ id: orderId }, { status: 'CONFIRMED' })
  }

  async markCancelled(orderId: string) {
    await this.orderRepo.update({ id: orderId }, { status: 'CANCELLED' })
  }

  async list(filter: { phone?: string; name?: string; status?: string }) {
    const qb = this.orderRepo.createQueryBuilder('o')

    if (filter.phone)
      qb.andWhere('o.customerPhone = :phone', { phone: filter.phone })
    if (filter.name)
      qb.andWhere('o.customerName ILIKE :name', { name: `%${filter.name}%` })
    if (filter.status)
      qb.andWhere('o.status = :status', { status: filter.status })

    qb.orderBy('o.createdAt', 'DESC')
    return qb.getMany()
  }
}
