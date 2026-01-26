import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class CreateFaqDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus = BasicStatus.active;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sort_order?: number = 0;
}

