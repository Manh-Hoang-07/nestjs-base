import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class GetProductAttributeValuesDto {
  @IsOptional()
  @IsNumber()
  attribute_id?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  include_deleted?: boolean;

  @IsOptional()
  @IsNumber()
  product_variant_id?: number;
}