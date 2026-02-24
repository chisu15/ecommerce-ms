import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ListOrdersDto {
  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED'])
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'

  // ISO date: YYYY-MM-DD
  @IsOptional()
  @IsString()
  from?: string

  @IsOptional()
  @IsString()
  to?: string

  // pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}
