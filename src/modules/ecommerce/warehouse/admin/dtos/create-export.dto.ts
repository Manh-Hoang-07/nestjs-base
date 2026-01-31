import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExportItemDto {
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

export class CreateExportDto {
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    warehouse_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExportItemDto)
    items: ExportItemDto[];

    @IsOptional()
    @IsString()
    reason?: string;
}
