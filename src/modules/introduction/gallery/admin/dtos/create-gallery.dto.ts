import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class CreateGalleryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  cover_image?: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  images: string[];

  @IsBoolean()
  @IsOptional()
  featured?: boolean = false;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus = BasicStatus.active;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sort_order?: number = 0;
}

