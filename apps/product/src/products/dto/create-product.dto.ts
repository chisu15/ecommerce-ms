import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @Length(2, 64)
  sku!: string

  @IsNumberString()
  price!: string
}
