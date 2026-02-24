import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  birthday?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  country_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  province_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ward_id?: number;

  @IsOptional()
  @IsString()
  about?: string;
}


