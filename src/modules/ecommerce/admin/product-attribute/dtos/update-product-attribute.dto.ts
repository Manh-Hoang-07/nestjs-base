import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { AttributeType } from '@/modules/ecommerce/admin/product-attribute/dtos/create-product-attribute.dto';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class UpdateProductAttributeDto {
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
  @IsEnum(AttributeType)
  type?: AttributeType;

  @IsOptional()
  @IsString()
  default_value?: string;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsBoolean()
  is_variation?: boolean;

  @IsOptional()
  @IsBoolean()
  is_filterable?: boolean;

  @IsOptional()
  @IsBoolean()
  is_visible_on_frontend?: boolean;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;

  @IsOptional()
  @IsString()
  validation_rules?: string;

  @IsOptional()
  @IsNumber()
  updated_user_id?: number;
}