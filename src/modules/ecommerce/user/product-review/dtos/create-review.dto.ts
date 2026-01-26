import { IsNumber, IsString, IsOptional, Min, Max, MaxLength, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsNumber()
  @Type(() => Number)
  product_id: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order_id?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  @MaxLength(2000)
  comment: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}