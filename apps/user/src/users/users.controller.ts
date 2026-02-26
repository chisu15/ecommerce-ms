import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { ListUsersDto } from '@app/common'

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  create(@Body() body: { fullName: string; phone: string; email?: string }) {
    return this.users.create(body)
  }

  @Get()
  list(@Query() q: ListUsersDto) {
    return this.users.list(q)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.findById(id)
  }
}
