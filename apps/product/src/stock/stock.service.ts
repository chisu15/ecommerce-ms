import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Stock } from './stock.entity'
import { StockReservation } from './stock-reservation.entity'

@Injectable()
export class StockService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(StockReservation)
    private readonly reservationRepo: Repository<StockReservation>,
  ) {}

  async get(productId: string) {
    return this.stockRepo.findOne({ where: { productId } })
  }

  async upsert(productId: string, availableQty: number) {
    return this.dataSource.transaction(async (manager) => {
      const existed = await manager.findOne(Stock, { where: { productId } })
      if (!existed) {
        const created = manager.create(Stock, {
          productId,
          availableQty,
          reservedQty: 0,
        })
        return manager.save(created)
      }

      existed.availableQty = availableQty
      // giữ reservedQty nguyên
      return manager.save(existed)
    })
  }

  /**
   * Reserve stock theo orderId (idempotent).
   * - Atomic (transaction)
   * - Chống race (pessimistic lock)
   * - Idempotent theo orderId (unique)
   */
  async reserve(
    orderId: string,
    items: Array<{ productId: string; qty: number }>,
  ) {
    if (!items?.length) return { ok: true, idempotent: true }

    return this.dataSource.transaction(async (manager) => {
      // idempotency
      const existed = await manager.findOne(StockReservation, {
        where: { orderId },
      })
      if (existed) return { ok: true, idempotent: true }

      // reserve từng item, lock row để tránh race
      for (const it of items) {
        const stock = await manager
          .createQueryBuilder(Stock, 's')
          .setLock('pessimistic_write')
          .where('s.productId = :pid', { pid: it.productId })
          .getOne()

        if (!stock) {
          throw new ConflictException(`No stock for product ${it.productId}`)
        }

        if (stock.availableQty < it.qty) {
          throw new ConflictException(
            `Insufficient stock for product ${it.productId}`,
          )
        }

        stock.availableQty -= it.qty
        stock.reservedQty += it.qty
        await manager.save(stock)
      }

      // 3) save reservation
      const reservation = manager.create(StockReservation, {
        orderId,
        items,
        status: 'RESERVED',
      })
      await manager.save(reservation)

      return { ok: true }
    })
  }
}
