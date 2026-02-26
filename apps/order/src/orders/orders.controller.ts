import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto, ListOrdersDto, CancelOrderDto } from '@app/common'

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
    @Headers('x-user-phone') userPhone: string,
    @Body() body: CreateOrderDto,
  ) {
    if (!userId) throw new UnauthorizedException('Missing user context')
    return this.orders.create(userId, userName || '', userPhone || '', body)
  }

  @Get(':id')
  async get(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    const order = await this.orders.get(id)

    if (order.customerId !== userId) throw new NotFoundException()
    return order
  }

  @Get()
  list(@Headers('x-user-id') userId: string, @Query() q: ListOrdersDto) {
    if (!userId) throw new UnauthorizedException('Missing user context')
    return this.orders.listByUser(userId, q)
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.orders.confirmAdmin(id)
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body() body: CancelOrderDto) {
    return this.orders.cancelAdmin(id, body?.reason)
  }

  @Get('report/daily')
  reportDaily(@Query('from') from: string, @Query('to') to: string) {
    return this.orders.reportDaily(from, to)
  }
}
