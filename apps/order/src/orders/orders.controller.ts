import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { ListOrdersDto } from './dto/list-orders.dto'
import { CancelOrderDto } from './dto/cancel-order.dto'

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() body: CreateOrderDto) {
    return this.orders.create(body)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.orders.get(id)
  }

  // GET /orders?phone=&name=&status=&from=&to=
  @Get()
  list(@Query() q: ListOrdersDto) {
    return this.orders.list(q)
  }

  // Admin actions (demo)
  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.orders.confirmAdmin(id)
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body() body: CancelOrderDto) {
    return this.orders.cancelAdmin(id, body?.reason)
  }

  // Report daily: /orders/report/daily?from=2026-02-01&to=2026-02-28
  @Get('report/daily')
  reportDaily(@Query('from') from: string, @Query('to') to: string) {
    return this.orders.reportDaily(from, to)
  }
}
