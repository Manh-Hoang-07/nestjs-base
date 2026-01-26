import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class GetProductAttributesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  include_deleted?: boolean;

  @IsOptional()
  @IsBoolean()
  include_values?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}