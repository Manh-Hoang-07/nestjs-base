import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPaymentsDto {
  @IsOptional()
  @IsString()
  cart_uuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'refunded'])
  status?: string;
}