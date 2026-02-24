import { IsOptional, IsString, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderAddressDto } from '@/modules/ecommerce/order/public/dtos/create-order.dto';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsOptional()
  @IsString()
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
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  tracking_number?: string;
}
