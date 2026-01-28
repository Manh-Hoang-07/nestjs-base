import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateProductAttributeValueDto {
  @IsOptional()
  @IsNumber()
  attribute_id?: number;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  color_code?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  // Note: product_variant_id is not a field of ProductAttributeValue
  // It belongs to ProductVariantAttribute (junction table)
  // This field is ignored if provided

  @IsOptional()
  @IsNumber()
  updated_user_id?: number;
}
