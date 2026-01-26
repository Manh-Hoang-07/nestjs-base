import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  position: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  department?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatar?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  social_links?: Record<string, any>;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  experience?: number;

  @IsString()
  @IsOptional()
  expertise?: string;

  @IsOptional()
  status?: BasicStatus = BasicStatus.active;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sort_order?: number = 0;
}

