import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Stock } from './stock.entity'
import { StockReservation } from './stock-reservation.entity'
import { StockController } from './stock.controller'
import { StockService } from './stock.service'

@Module({
  imports: [TypeOrmModule.forFeature([Stock, StockReservation])],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
