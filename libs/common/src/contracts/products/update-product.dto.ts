import { IsNumberString, IsOptional, IsString } from 'class-validator'

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsNumberString()
  price?: string
}
