import { IsString, IsNumber, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsNotEmpty()
  shipping_address: any;

  @IsOptional()
  billing_address?: any;

  @IsNumber()
  @Type(() => Number)
  shipping_method_id: number;

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