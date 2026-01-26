import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductAttributeValueDto {
  @IsNumber()
  attribute_id: number;

  @IsString()
  value: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsNumber()
  product_variant_id?: number;

  @IsOptional()
  created_user_id?: number;
}