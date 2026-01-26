import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class GetProductCategoriesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  include_deleted?: boolean;

  @IsOptional()
  @IsBoolean()
  include_children?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}