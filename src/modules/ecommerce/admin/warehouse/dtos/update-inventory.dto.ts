import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsNumber()
  @Min(1)
  warehouse_id: number;

  @IsNumber()
  @Min(1)
  product_variant_id: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock_level?: number;
}