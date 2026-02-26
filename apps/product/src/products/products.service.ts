import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from './product.entity'

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  create(data: { name: string; sku: string; price: string }) {
    return this.repo.save(this.repo.create(data))
  }

  async list(filter: {
    sku?: string
    name?: string
    page?: number
    limit?: number
  }) {
    const page = Math.max(1, Number(filter.page || 1))
    const limit = Math.min(100, Math.max(1, Number(filter.limit || 10)))
    const skip = (page - 1) * limit

    // sku = exact match
    const qb = this.repo.createQueryBuilder('p')

    if (filter.sku) qb.andWhere('p.sku = :sku', { sku: filter.sku })
    if (filter.name) qb.andWhere('p.name ILIKE :q', { q: `%${filter.name}%` })

    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit)

    const [data, total] = await qb.getManyAndCount()

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async findById(id: string) {
    const p = await this.repo.findOne({ where: { id } })
    if (!p) throw new NotFoundException('Product not found')
    return p
  }

  findBySku(sku: string) {
    return this.repo.findOne({ where: { sku } })
  }

  searchByName(name: string) {
    return this.repo
      .createQueryBuilder('p')
      .where('p.name ILIKE :q', { q: `%${name}%` })
      .orderBy('p.createdAt', 'DESC')
      .getMany()
  }

  async update(id: string, patch: { name?: string; price?: string }) {
    const p = await this.findById(id)
    if (patch.name !== undefined) p.name = patch.name
    if (patch.price !== undefined) p.price = patch.price
    return this.repo.save(p)
  }

  async remove(id: string) {
    const p = await this.findById(id)
    await this.repo.remove(p)
    return { deleted: true }
  }
}
