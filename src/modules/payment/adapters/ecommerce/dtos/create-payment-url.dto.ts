import { IsNumber, IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentUrlDto {
  @IsNumber()
  @Type(() => Number)
  order_id: number;

  @IsString()
  @IsEnum(['vnpay', 'momo', 'cod'])
  payment_method_code: 'vnpay' | 'momo' | 'cod';

  @IsOptional()
  @IsEmail()
  customer_email?: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsString()
  customer_name?: string;
}