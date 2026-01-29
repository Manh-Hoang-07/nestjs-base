import { IsString, IsNumber, IsOptional, Min, MaxLength, IsEnum, IsArray, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { BasicStatus } from '@/shared/enums';

class VariantAttributeDto {
  /**
   * Preferred (current FE contract)
   */
  @ValidateIf((o) => o.attribute_id === undefined)
  @IsNumber()
  @Type(() => Number)
  product_attribute_id?: number;

  @ValidateIf((o) => o.value_id === undefined)
  @IsNumber()
  @Type(() => Number)
  product_attribute_value_id?: number;

  /**
   * Backward compatibility (older contract)
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  attribute_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  value_id?: number;
}

export class CreateProductVariantDto {
  @IsNumber()
  product_id: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @IsString()
  @MaxLength(100)
  sku: string;

  @IsString()
  price: string;

  @IsString()
  @IsOptional()
  sale_price?: string;

  @IsString()
  @IsOptional()
  cost_price?: string;

  @IsNumber()
  @Min(0)
  stock_quantity: number;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  image?: string;

  @IsEnum(BasicStatus)
  @IsOptional()
  status?: BasicStatus = BasicStatus.active;

  // Danh sách thuộc tính của biến thể (attribute/value đã chọn)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes?: VariantAttributeDto[];
}
