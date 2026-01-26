import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class GetProductDto {
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
  include_attributes?: string;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;
}