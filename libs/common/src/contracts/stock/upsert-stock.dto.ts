import { IsInt, IsUUID, Min } from 'class-validator'

export class UpsertStockDto {
  @IsUUID()
  productId!: string

  @IsInt()
  @Min(0)
  qtyAvailable!: number
}
