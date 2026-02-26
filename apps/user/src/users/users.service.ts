import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(data: { fullName: string; phone: string; email?: string }) {
    const u = this.repo.create(data)
    return this.repo.save(u)
  }

  async list(filter: {
    phone?: string
    name?: string
    page?: number
    limit?: number
  }) {
    const page = Math.max(1, Number(filter.page || 1))
    const limit = Math.min(100, Math.max(1, Number(filter.limit || 10)))
    const skip = (page - 1) * limit

    const qb = this.repo.createQueryBuilder('u')

    if (filter.phone) qb.andWhere('u.phone = :phone', { phone: filter.phone })
    if (filter.name)
      qb.andWhere('u.name ILIKE :name', { name: `%${filter.name}%` })

    qb.orderBy('u.createdAt', 'DESC').skip(skip).take(limit)

    const [data, total] = await qb.getManyAndCount()

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async findByPhone(phone: string) {
    return this.repo.findOne({ where: { phone } })
  }

  async createWithPassword(data: {
    phone: string
    name: string
    password: string
  }) {
    const existed = await this.findByPhone(data.phone)
    if (existed) throw new Error('PHONE_EXISTS')

    const passwordHash = await bcrypt.hash(data.password, 10)
    const user = this.repo.create({
      phone: data.phone,
      name: data.name,
      passwordHash: passwordHash,
    })
    return this.repo.save(user)
  }

  async validatePassword(phone: string, password: string) {
    const user = await this.findByPhone(phone)
    if (!user) return null
    const ok = await bcrypt.compare(password, user.passwordHash)
    return ok ? user : null
  }
}
