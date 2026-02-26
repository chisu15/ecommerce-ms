import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { StockService } from './stock.service'
import { ReserveStockDto } from '@app/common'

@Controller('stock')
export class StockController {
  constructor(private readonly stock: StockService) {}

  @Post('reserve')
  reserve(@Body() dto: ReserveStockDto) {
    return this.stock.reserve(dto.orderId, dto.items)
  }

  @Get(':productId')
  detail(@Param('productId') productId: string) {
    return this.stock.get(productId)
  }

  @Put('upsert')
  upsert(@Body() body: { productId: string; availableQty: number }) {
    return this.stock.upsert(body.productId, body.availableQty)
  }
}
