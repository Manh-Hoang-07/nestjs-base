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
import { Type, Transform } from 'class-transformer';

export enum CouponType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
}

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
  @Transform(({ value }) => value === 'percent' ? CouponType.PERCENTAGE : value)
  type: CouponType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_order_value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  usage_limit?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  usage_per_customer: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsDate()
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsDate()
  @Type(() => Date)
  end_date?: Date;

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
