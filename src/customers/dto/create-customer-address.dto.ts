import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCustomerAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsBoolean()
  isBilling?: boolean;

  @IsOptional()
  @IsBoolean()
  isShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
