import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateShippingDto {
  @IsNumber()
  @Type(() => Number)
  shipping_method_id: number;

  @IsNumber()
  @Type(() => Number)
  cart_value: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  destination?: string;
}