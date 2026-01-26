import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class GetShippingMethodsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  include_deleted?: boolean;
}