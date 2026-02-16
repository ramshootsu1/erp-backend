import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerContactDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
