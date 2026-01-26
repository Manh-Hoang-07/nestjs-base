import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    MaxLength,
    IsObject,
} from 'class-validator';
import { TemplateCategory } from '@/shared/enums/types/template-category.enum';
import { TemplateType } from '@/shared/enums/types/template-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class CreateContentTemplateDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    code: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsEnum(TemplateCategory)
    category: TemplateCategory;

    @IsEnum(TemplateType)
    type: TemplateType;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    file_path?: string;

    @IsObject()
    @IsOptional()
    metadata?: any;

    @IsObject()
    @IsOptional()
    variables?: any;

    @IsOptional()
    @IsEnum(BasicStatus)
    status?: BasicStatus = BasicStatus.active;
}
