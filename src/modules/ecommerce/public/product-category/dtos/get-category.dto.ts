import { IsOptional, IsString } from 'class-validator';

export class GetCategoryDto {
  @IsOptional()
  @IsString()
  include?: string;

  @IsOptional()
  @IsString()
  include_products?: string;

  @IsOptional()
  @IsString()
  include_children?: string;
}