import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { StockService } from './stock.service'
import { UpsertStockDto } from './dto/upsert-stock.dto'
import { AdjustStockDto } from './dto/adjust-stock.dto'

@Controller('stock')
export class StockController {
  constructor(private readonly stock: StockService) {}

  @Put('upsert')
  upsert(@Body() body: UpsertStockDto) {
    return this.stock.upsertStock(body.productId, body.qtyAvailable)
  }

  @Get(':productId')
  get(@Param('productId') productId: string) {
    return this.stock.getStock(productId)
  }

  @Post('add')
  add(@Body() body: AdjustStockDto) {
    return this.stock.addStock(body.productId, body.delta)
  }

  @Post('deduct')
  deduct(@Body() body: AdjustStockDto) {
    return this.stock.deductStock(body.productId, body.delta)
  }

  // debug idempotency
  @Get('reservations/by-order')
  reservation(@Query('orderId') orderId: string) {
    return this.stock.reservationByOrderId(orderId)
  }
}
