import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateCategory } from '@/shared/enums/types/template-category.enum';
import { TemplateType } from '@/shared/enums/types/template-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class ContentTemplateQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(TemplateCategory)
    category?: TemplateCategory;

    @IsOptional()
    @IsEnum(TemplateType)
    type?: TemplateType;

    @IsOptional()
    @IsEnum(BasicStatus)
    status?: BasicStatus;
}
