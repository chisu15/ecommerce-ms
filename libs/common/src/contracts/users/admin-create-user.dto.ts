import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'


export class AdminCreateUserDto {
  @IsString()
  @IsNotEmpty()
  phone!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: string
}
