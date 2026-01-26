import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength, IsEnum } from 'class-validator';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

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
  status?: BasicStatus = BasicStatus.Active;
}