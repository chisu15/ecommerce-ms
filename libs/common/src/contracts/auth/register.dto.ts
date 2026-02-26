import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @Matches(/^[0-9]{9,11}$/)
  phone!: string

  @IsString()
  @Length(6, 64)
  password!: string
}
