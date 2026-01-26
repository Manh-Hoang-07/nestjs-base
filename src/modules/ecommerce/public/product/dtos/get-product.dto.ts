import { IsOptional, IsString, IsEnum } from 'class-validator';

export class GetProductDto {
  @IsOptional()
  @IsString()
  include?: string;

  @IsOptional()
  @IsString()
  include_categories?: string;

  @IsOptional()
  @IsString()
  include_attributes?: string;
}