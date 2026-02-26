import { Type } from 'class-transformer'
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator'

export class ReserveItemDto {
  @IsUUID()
  productId!: string

  @IsInt()
  @Min(1)
  qty!: number
}

export class ReserveStockDto {
  @IsUUID()
  orderId!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReserveItemDto)
  items!: ReserveItemDto[]
}
