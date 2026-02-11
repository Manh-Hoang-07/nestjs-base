import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BulkImportAssetDto {
    @IsNumber()
    @IsNotEmpty()
    product_id: number;

    @IsNumber()
    @IsOptional()
    product_variant_id?: number;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    contents: string[];
}
