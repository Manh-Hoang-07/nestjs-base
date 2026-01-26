import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductVariantsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  product_id?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_deleted?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_product?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_attributes?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string = 'created_at:DESC';
}