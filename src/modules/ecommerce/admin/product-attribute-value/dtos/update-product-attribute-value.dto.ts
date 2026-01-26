import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateProductAttributeValueDto {
  @IsOptional()
  @IsNumber()
  attribute_id?: number;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsNumber()
  product_variant_id?: number;

  @IsOptional()
  @IsNumber()
  updated_user_id?: number;
}