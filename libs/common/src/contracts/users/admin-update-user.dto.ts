import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: string

}
