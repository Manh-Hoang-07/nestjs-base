import { TemplateCategory } from '@prisma/client';

export { TemplateCategory };

export const TemplateCategoryLabels: Record<TemplateCategory, string> = {
    [TemplateCategory.render]: 'Tự động biên dịch (Render)',
    [TemplateCategory.file]: 'Tập tin mẫu (File)',
};
