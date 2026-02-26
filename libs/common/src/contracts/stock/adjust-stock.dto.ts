import { IsInt, IsUUID, Min } from 'class-validator'

export class AdjustStockDto {
  @IsUUID()
  productId!: string

  @IsInt()
  @Min(1)
  delta!: number
}
