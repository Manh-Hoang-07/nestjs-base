import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductAttributeValueDto {
  @IsNumber()
  attribute_id: number;

  @IsString()
  value: string;

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
  created_user_id?: number;
}
