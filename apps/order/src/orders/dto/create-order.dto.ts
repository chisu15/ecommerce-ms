import { Type } from 'class-transformer'
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'

export class CreateOrderItemDto {
  @IsUUID()
  productId!: string

  @IsString()
  @IsNotEmpty()
  productName!: string

  @IsNumberString()
  unitPrice!: string

  @IsInt()
  @Min(1)
  qty!: number
}

export class CreateOrderDto {
  @IsUUID()
  customerId!: string

  @IsString()
  @IsNotEmpty()
  customerName!: string

  @IsString()
  @IsNotEmpty()
  customerPhone!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[]
}
