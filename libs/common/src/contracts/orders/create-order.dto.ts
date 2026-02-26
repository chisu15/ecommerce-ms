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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[]
}
