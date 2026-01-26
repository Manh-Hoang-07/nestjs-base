import { IRepository } from '@/common/core/repositories';
import { ContentTemplate } from '@prisma/client';
import { TemplateCategory } from '@/shared/enums/types/template-category.enum';
import { TemplateType } from '@/shared/enums/types/template-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export interface ContentTemplateFilter {
    search?: string;
    code?: string;
    category?: TemplateCategory;
    type?: TemplateType;
    status?: BasicStatus;
}

export interface IContentTemplateRepository extends IRepository<ContentTemplate> {
    findByCode(code: string): Promise<ContentTemplate | null>;
}

export const CONTENT_TEMPLATE_REPOSITORY = 'CONTENT_TEMPLATE_REPOSITORY';
