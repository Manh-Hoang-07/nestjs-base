import { IsString, IsOptional, IsNumber, IsBoolean, IsObject, IsArray, IsEnum } from 'class-validator';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsNumber()
  min_stock_level?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  // Gallery có thể là object hoặc mảng rỗng
  gallery?: any;

  @IsOptional()
  @IsEnum(ProductStatus)
  @Transform(({ value }) => {
    // Chuyển đổi chuỗi thành enum
    if (typeof value === 'string') {
      // Tìm enum value khớp với chuỗi
      const enumValue = Object.values(ProductStatus).find(
        (enumVal) => enumVal === value
      );
      return enumValue || value;
    }
    return value;
  })
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category_ids?: string[];

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  is_variable?: boolean;

  @IsOptional()
  @IsBoolean()
  is_digital?: boolean;

  @IsOptional()
  @IsNumber()
  download_limit?: number;

  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsString()
  canonical_url?: string;

  @IsOptional()
  @IsString()
  og_title?: string;

  @IsOptional()
  @IsString()
  og_description?: string;

  @IsOptional()
  @IsString()
  og_image?: string;

  @IsOptional()
  @IsNumber()
  updated_user_id?: number;
}