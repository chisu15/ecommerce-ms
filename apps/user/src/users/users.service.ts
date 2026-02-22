import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(data: { fullName: string; phone: string; email?: string }) {
    const u = this.repo.create(data)
    return this.repo.save(u)
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async findByPhone(phone: string) {
    const u = await this.repo.findOne({ where: { phone } })
    if (!u) throw new NotFoundException('User not found')
    return u
  }
}
