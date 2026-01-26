import {
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '@/shared/entities/coupon.entity';

export class CreateCouponDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @Min(0)
  min_order_value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_discount_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usage_limit?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  usage_per_customer: number;

  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  applicable_products?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  applicable_categories?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  excluded_products?: number[];

  @IsOptional()
  @IsBoolean()
  first_order_only?: boolean;
}