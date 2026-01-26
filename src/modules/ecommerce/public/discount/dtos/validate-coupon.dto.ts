import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  coupon_code: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cart_total?: number;
}