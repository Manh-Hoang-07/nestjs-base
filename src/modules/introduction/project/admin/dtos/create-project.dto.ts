import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '@/shared/enums/types/project-status.enum';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

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
  short_description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  cover_image?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  area?: number;

  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus = ProjectStatus.planning;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  client_name?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  budget?: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsBoolean()
  @IsOptional()
  featured?: boolean = false;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sort_order?: number = 0;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  meta_title?: string;

  @IsString()
  @IsOptional()
  meta_description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  canonical_url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  og_image?: string;
}

