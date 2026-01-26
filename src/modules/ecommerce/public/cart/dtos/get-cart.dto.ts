import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GetCartDto {

  @IsOptional()
  @IsUUID()
  cart_uuid?: string;
}