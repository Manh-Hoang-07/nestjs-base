import { IsString, IsOptional, IsEnum, IsObject, IsBoolean, IsInt } from 'class-validator';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { PaymentType } from '@/shared/enums/types/payment-type.enum';

export class CreatePaymentMethodDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

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