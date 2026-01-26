import { IsString, IsOptional, IsEnum, IsObject, IsNumber, IsBoolean, IsInt } from 'class-validator';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { PaymentType } from '@/shared/enums/types/payment-type.enum';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsObject()
  config?: any;

  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;

  @IsOptional()
  @IsNumber()
  updated_user_id?: number;

  // Legacy fields - accepted but not stored in DB
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  display_order?: number;

  @IsOptional()
  @IsString()
  icon?: string;
}