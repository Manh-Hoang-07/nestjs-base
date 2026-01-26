import { IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AttributeFilterDto {
  @IsNumber()
  attribute_id: number;

  @IsNumber()
  value_id: number;
}

export class SearchVariantsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  product_id?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeFilterDto)
  attributes?: AttributeFilterDto[];
}