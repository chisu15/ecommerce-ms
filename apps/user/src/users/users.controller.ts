import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  create(@Body() body: { fullName: string; phone: string; email?: string }) {
    return this.users.create(body)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.findById(id)
  }

  @Get('by-phone/:phone')
  getByPhone(@Param('phone') phone: string) {
    return this.users.findByPhone(phone)
  }
}
