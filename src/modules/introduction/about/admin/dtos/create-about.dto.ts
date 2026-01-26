import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AboutSectionType } from '@/shared/enums/types/about-section-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class CreateAboutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  image?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  video_url?: string;

  @IsOptional()
  @IsEnum(AboutSectionType)
  section_type?: AboutSectionType = AboutSectionType.history;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus = BasicStatus.active;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sort_order?: number = 0;
}

