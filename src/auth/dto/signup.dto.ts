import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  tenantName: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}