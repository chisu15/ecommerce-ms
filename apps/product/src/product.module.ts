import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { OutboxModule } from './outbox/outbox.module';
import { StreamsModule } from './streams/streams.module';

@Module({
  imports: [ProductsModule, StockModule, OutboxModule, StreamsModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
