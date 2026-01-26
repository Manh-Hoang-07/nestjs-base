import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsNumber()
  @Type(() => Number)
  order_id: number;

  @IsNumber()
  @Type(() => Number)
  payment_method_id: number;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  payment_method_code?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}


