import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockTransferDto {
  @IsNumber()
  @Min(1)
  from_warehouse_id: number;

  @IsNumber()
  @Min(1)
  to_warehouse_id: number;

  @IsNumber()
  @Min(1)
  product_variant_id: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}