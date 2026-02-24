import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ListProductsDto } from './dto/list-product.dto'

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.products.create(body)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.products.findById(id)
  }

  // GET /products?sku=xxx&name=yyy&page=1&limit=20
  @Get()
  list(@Query() q: ListProductsDto) {
    return this.products.list(q)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.products.update(id, body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.remove(id)
  }
}
