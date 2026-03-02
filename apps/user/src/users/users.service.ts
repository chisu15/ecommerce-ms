import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User, UserRole } from './user.entity'
import * as bcrypt from 'bcrypt'
import { UpdateMeDto } from '@app/common'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  safeUser(u: User) {
    const { passwordHash, ...rest } = u as any
    return rest
  }
  async adminCreate(dto: {
    phone: string
    name: string
    password: string
    role: UserRole
  }) {
    const existed = await this.repo.findOne({ where: { phone: dto.phone } })
    if (existed) throw new BadRequestException('Phone already exists')
      
    const passwordHash = await bcrypt.hash(dto.password, 10)

    const user = this.repo.create({
      phone: dto.phone,
      name: dto.name,
      passwordHash,
      role: dto.role ?? 'USER',
    })

    const saved = await this.repo.save(user)
    return this.safeUser(saved)
  }

  async adminUpdate(
    id: string,
    dto?: {
      phone?: string
      name?: string
      password?: string
      role?: UserRole
    },
  ) {
    const user = await this.findById(id)

    if (!dto) return this.safeUser(user)

    if (dto.phone && dto.phone !== user.phone) {
      const existed = await this.repo.findOne({ where: { phone: dto.phone } })
      if (existed) throw new BadRequestException('Phone already exists')
      user.phone = dto.phone
    }

    if (dto.name) user.name = dto.name
    if (dto.role) user.role = dto.role

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10)
    }

    const saved = await this.repo.save(user)
    return this.safeUser(saved)
  }

  async adminDelete(id: string) {
    const user = await this.findById(id)
    await this.repo.delete({ id: user.id })
    return { ok: true }
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
    const user = await this.repo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    return user
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

  async me(userId: string) {
    const user = await this.findById(userId)
    return this.safeUser(user)
  }

  async updateMe(userId: string, dto?: UpdateMeDto) {
    const user = await this.findById(userId)
    if (dto?.name) user.name = dto.name
    const saved = await this.repo.save(user)
    return this.safeUser(saved)
  }
}
