import { IsOptional, IsEnum, IsNumber, Min, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOrdersDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  @IsOptional()
  @IsEnum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

  @IsOptional()
  @IsEnum(['pending', 'preparing', 'shipped', 'delivered', 'returned'])
  shippingStatus?: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'returned';

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}