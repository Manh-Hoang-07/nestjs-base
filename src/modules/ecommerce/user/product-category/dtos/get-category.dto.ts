import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class GetCategoryDto {
  @IsOptional()
  @IsString()
  include?: string;

  @IsOptional()
  @IsString()
  include_variants?: string;

  @IsOptional()
  @IsString()
  include_categories?: string;

  @IsOptional()
  @IsString()
  include_children?: string;

  @IsOptional()
  @IsString()
  include_products?: string;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;
}