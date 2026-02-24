import { IsString, IsNumber, IsOptional, IsEmail, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderAddressDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  // Backward-compatible fields (đang được GHNProvider dùng để format địa chỉ)
  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  country_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  province_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ward_id?: number;

  @IsOptional()
  @IsString()
  country_name?: string;

  @IsOptional()
  @IsString()
  province_name?: string;

  @IsOptional()
  @IsString()
  ward_name?: string;

  // Các field phục vụ GHN (optional)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  district_id?: number;

  @IsOptional()
  @IsString()
  ward_code?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsOptional()
  @IsEmail()
  customer_email?: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OrderAddressDto)
  shipping_address?: OrderAddressDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OrderAddressDto)
  billing_address?: OrderAddressDto;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  shipping_method_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  payment_method_id?: number;

  @IsOptional()
  @IsString()
  notes?: string;


  @IsOptional()
  @IsString()
  cart_uuid?: string;
}
