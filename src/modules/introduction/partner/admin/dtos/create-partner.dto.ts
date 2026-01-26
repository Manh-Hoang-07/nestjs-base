import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartnerType } from '@/shared/enums/types/partner-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  logo: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(PartnerType)
  type?: PartnerType = PartnerType.client;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus = BasicStatus.active;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sort_order?: number = 0;
}

