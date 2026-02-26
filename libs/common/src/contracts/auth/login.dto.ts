import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class LoginDto {
  @IsString()
  @Matches(/^[0-9]{9,11}$/)
  phone!: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 64)
  password!: string
}
