import { Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ProductsModule } from './products/products.module'
import { StockModule } from './stock/stock.module'
import { OutboxModule } from './outbox/outbox.module'
import { StreamsModule } from './streams/streams.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/product/.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProductsModule,
    StockModule,
    OutboxModule,
    StreamsModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
