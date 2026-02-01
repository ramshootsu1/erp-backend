import { IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
