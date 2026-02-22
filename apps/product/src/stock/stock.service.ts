import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Stock } from './stock.entity'
import { StockReservation } from './stock-reservation.entity'

@Injectable()
export class StockService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Stock) private stockRepo: Repository<Stock>,
    @InjectRepository(StockReservation)
    private resRepo: Repository<StockReservation>,
  ) {}

  async getStock(productId: string) {
    return this.stockRepo.findOne({ where: { productId } })
  }

  async upsertStock(productId: string, qtyAvailable: number) {
    const existing = await this.stockRepo.findOne({ where: { productId } })
    if (!existing) {
      return this.stockRepo.save(
        this.stockRepo.create({ productId, qtyAvailable, qtyReserved: 0 }),
      )
    }
    existing.qtyAvailable = qtyAvailable
    return this.stockRepo.save(existing)
  }

  async addStock(productId: string, delta: number) {
    const s = await this.stockRepo.findOne({ where: { productId } })
    if (!s) {
      return this.stockRepo.save(
        this.stockRepo.create({
          productId,
          qtyAvailable: delta,
          qtyReserved: 0,
        }),
      )
    }
    s.qtyAvailable += delta
    return this.stockRepo.save(s)
  }

  async deductStock(productId: string, delta: number) {
    // admin xuất kho manual: không cho âm
    const s = await this.stockRepo.findOne({ where: { productId } })
    if (!s) return null
    s.qtyAvailable = Math.max(0, s.qtyAvailable - delta)
    return this.stockRepo.save(s)
  }

  /**
   * Idempotent reserve by orderId (unique in stock_reservations)
   */
  async reserve(
    orderId: string,
    items: Array<{ productId: string; qty: number }>,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const existed = await manager.findOne(StockReservation, {
        where: { orderId },
      })
      if (existed) {
        return { ok: true as const, alreadyReserved: true as const }
      }

      const stockMap = new Map<string, Stock>()
      for (const it of items) {
        const s = await manager.findOne(Stock, {
          where: { productId: it.productId },
        })
        if (!s)
          return { ok: false as const, reason: `NO_STOCK_${it.productId}` }
        stockMap.set(it.productId, s)
      }

      for (const it of items) {
        const s = stockMap.get(it.productId)!
        if (s.qtyAvailable < it.qty) {
          return { ok: false as const, reason: `INSUFFICIENT_${it.productId}` }
        }
      }

      for (const it of items) {
        const s = stockMap.get(it.productId)!
        s.qtyAvailable -= it.qty
        s.qtyReserved += it.qty
        await manager.save(s)
      }

      await manager.save(manager.create(StockReservation, { orderId, items }))

      return { ok: true as const, alreadyReserved: false as const }
    })
  }

  async reservationByOrderId(orderId: string) {
    return this.resRepo.findOne({ where: { orderId } })
  }
}
