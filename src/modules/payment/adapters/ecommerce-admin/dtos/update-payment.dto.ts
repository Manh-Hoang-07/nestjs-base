import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'refunded'])
  status?: string;

  @IsOptional()
  @IsDateString()
  paid_at?: string;

  @IsOptional()
  @IsDateString()
  refunded_at?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}


