import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class GetProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

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
  @IsBoolean()
  include_deleted?: boolean;

  @IsOptional()
  @IsBoolean()
  include_categories?: boolean;

  @IsOptional()
  @IsBoolean()
  include_variants?: boolean;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  category_ids?: string[];
}