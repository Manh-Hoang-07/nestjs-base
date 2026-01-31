import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ImportItemDto {
    @IsOptional()
    @IsNumber()
    product_id?: number;

    @IsNumber()
    @Min(1)
    product_variant_id: number;

    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateImportDto {
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    warehouse_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportItemDto)
    items: ImportItemDto[];

    @IsOptional()
    @IsString()
    reason?: string;
}
