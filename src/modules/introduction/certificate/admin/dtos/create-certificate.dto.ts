import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CertificateType } from '@/shared/enums/types/certificate-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class CreateCertificateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  image: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  issued_by?: string;

  @IsOptional()
  @Type(() => Date)
  issued_date?: Date;

  @IsOptional()
  @Type(() => Date)
  expiry_date?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  certificate_number?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(CertificateType)
  type?: CertificateType = CertificateType.license;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus = BasicStatus.active;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sort_order?: number = 0;
}

