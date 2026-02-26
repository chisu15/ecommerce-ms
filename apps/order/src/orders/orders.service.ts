import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { DataSource, Repository } from 'typeorm'
import { ProductsClient } from '../products/products.client'
import { Order } from './order.entity'
import { OrderItem } from './order-item.entity'

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly products: ProductsClient,
  ) {}

  async create(
    userId: string,
    userName: string,
    userPhone: string,
    body: {
      items: Array<{
        productId: string
        productName: string
        unitPrice: string
        qty: number
      }>
    },
  ) {
    const orderId = randomUUID()

    // reserve stock
    const reserveRes = await this.products.reserveStock({
      orderId,
      items: body.items.map((i) => ({ productId: i.productId, qty: i.qty })),
    })

    if (reserveRes.status >= 400) {
      throw new ConflictException(
        reserveRes.data?.message || 'Reserve stock failed',
      )
    }

    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        id: orderId,
        customerId: userId,
        customerName: userName,
        customerPhone: userPhone,
        status: 'CONFIRMED',
      })

      order.items = body.items.map((it) =>
        manager.create(OrderItem, {
          productId: it.productId,
          productNameSnapshot: it.productName,
          unitPriceSnapshot: it.unitPrice,
          qty: it.qty,
          lineTotal: (Number(it.unitPrice) * it.qty).toFixed(2),
        }),
      )

      const total = order.items.reduce<number>(
        (sum, item) => sum + Number(item.lineTotal),
        0,
      )
      order.totalAmount = total.toFixed(2)

      return manager.save(order)
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

  async listByUser(
    userId: string,
    filter: {
      status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
      page?: number
      limit?: number
    },
  ) {
    const page = Math.max(1, Number(filter.page || 1))
    const limit = Math.min(100, Math.max(1, Number(filter.limit || 10)))
    const skip = (page - 1) * limit

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .where('o.customerId = :userId', { userId })

    if (filter.status)
      qb.andWhere('o.status = :status', { status: filter.status })

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

  async confirmAdmin(orderId: string) {
    const o = await this.orderRepo.findOne({ where: { id: orderId } })
    if (!o) throw new NotFoundException('Order not found')
    o.status = 'CONFIRMED'
    return this.orderRepo.save(o)
  }

  async cancelAdmin(orderId: string, _reason?: string) {
    const o = await this.orderRepo.findOne({ where: { id: orderId } })
    if (!o) throw new NotFoundException('Order not found')
    o.status = 'CANCELLED'
    return this.orderRepo.save(o)
  }

  async reportDaily(from: string, to: string) {
    const rows = await this.orderRepo.query(
      `
      SELECT
        DATE(o.createdAt) AS day,
        COUNT(*)::int AS orders,
        SUM(o.totalAmount::numeric)::text AS revenue
      FROM orders o
      WHERE o.status = 'CONFIRMED'
        AND o.createdAt >= $1::date
        AND o.createdAt <= ($2::date + INTERVAL '1 day' - INTERVAL '1 second')
      GROUP BY DATE(o.createdAt)
      ORDER BY day ASC
      `,
      [from, to],
    )
    return rows
  }
}
