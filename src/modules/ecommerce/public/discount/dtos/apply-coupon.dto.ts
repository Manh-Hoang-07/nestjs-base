import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class ApplyCouponDto {
  @IsOptional()
  @IsNumber()
  cart_id?: number;

  @IsOptional()
  @IsUUID()
  cart_uuid?: string;

  @IsString()
  coupon_code: string;
}