import { IsNumber, IsOptional, IsUUID, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @IsNumber()
  @Type(() => Number)
  cart_item_id: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;


  @IsOptional()
  @IsUUID()
  cart_uuid?: string;
}