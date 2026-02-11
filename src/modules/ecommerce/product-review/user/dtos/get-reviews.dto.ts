import { IsOptional, IsNumber, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BasicStatus } from '@/shared/enums';

export class GetReviewsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  product_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  user_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}


