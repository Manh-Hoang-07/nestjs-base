import { IsOptional, IsString, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

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
  shipping_address?: any;

  @IsOptional()
  @IsObject()
  billing_address?: any;

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