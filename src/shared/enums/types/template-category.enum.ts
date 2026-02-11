export enum TemplateCategory {
    render = 'render',
    file = 'file',
}

/**
 * Labels cho TemplateCategory
 */
export const TemplateCategoryLabels: Record<TemplateCategory, string> = {
    [TemplateCategory.render]: 'Tự động biên dịch (Render)',
    [TemplateCategory.file]: 'Tập tin mẫu (File)',
};


