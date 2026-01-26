import { TemplateType } from '@prisma/client';

export { TemplateType };

export const TemplateTypeLabels: Record<TemplateType, string> = {
    [TemplateType.email]: 'Email',
    [TemplateType.telegram]: 'Telegram',
    [TemplateType.zalo]: 'Zalo',
    [TemplateType.sms]: 'SMS',
    [TemplateType.pdf_generated]: 'PDF (từ HTML)',
    [TemplateType.file_word]: 'Tài liệu Word (.docx)',
    [TemplateType.file_excel]: 'Bảng tính Excel (.xlsx)',
    [TemplateType.file_pdf]: 'Tài liệu PDF có sẵn (.pdf)',
};
