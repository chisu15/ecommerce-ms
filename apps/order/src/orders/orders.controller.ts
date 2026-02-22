/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { OrdersService } from './orders.service'

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() body: any) {
    return this.orders.create(body)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.orders.findById(id)
  }

  @Get()
  list(
    @Query('phone') phone?: string,
    @Query('name') name?: string,
    @Query('status') status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  ) {
    return this.orders.list({ phone, name, status })
  }
}
