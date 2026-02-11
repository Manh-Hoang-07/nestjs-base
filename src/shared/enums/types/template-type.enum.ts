export enum TemplateType {
    email = 'email',
    telegram = 'telegram',
    zalo = 'zalo',
    sms = 'sms',
    pdf_generated = 'pdf_generated',
    file_word = 'file_word',
    file_excel = 'file_excel',
    file_pdf = 'file_pdf',
}

/**
 * Labels cho TemplateType
 */
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


