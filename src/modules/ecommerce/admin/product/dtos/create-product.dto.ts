import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsNotEmpty,
  Length,
  Min,
  Max,
  Matches,
  IsUrl,
  IsInt,
  IsEnum,
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@/shared/enums/product-status.enum';

/**
 * Create Product DTO with comprehensive validation
 */
export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @Length(3, 255, { message: 'Product name must be between 3 and 255 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]+$/, {
    message: 'Product name contains invalid characters'
  })
  name: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens'
  })
  slug?: string;

  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  @Length(3, 100, { message: 'SKU must be between 3 and 100 characters' })
  @Matches(/^[A-Za-z0-9\-_]+$/, {
    message: 'SKU must contain only letters, numbers, hyphens, and underscores'
  })
  sku: string;

  @IsOptional()
  @IsString()
  @Length(0, 10000, { message: 'Description cannot exceed 10000 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Short description cannot exceed 500 characters' })
  short_description?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Minimum stock level cannot be negative' })
  @Max(9999, { message: 'Minimum stock level cannot exceed 9999' })
  @Type(() => Number)
  min_stock_level?: number;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  @Length(0, 500)
  image?: string;

  @IsOptional()
  // Gallery có thể là object hoặc mảng rỗng
  gallery?: any;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category_ids?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_variable?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_digital?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  @Type(() => Number)
  download_limit?: number;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  meta_title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  meta_description?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Canonical URL must be a valid URL' })
  @Length(0, 500)
  canonical_url?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  og_title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  og_description?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'OG image must be a valid URL' })
  @Length(0, 500)
  og_image?: string;
}