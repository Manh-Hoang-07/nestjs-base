import { AboutSectionType } from '@prisma/client';

/**
 * About Section Type Enum
 * Import từ Prisma
 */
export { AboutSectionType };

export const AboutSectionTypeLabels: Record<AboutSectionType, string> = {
  [AboutSectionType.history]: 'Lịch sử',
  [AboutSectionType.mission]: 'Sứ mệnh',
  [AboutSectionType.vision]: 'Tầm nhìn',
  [AboutSectionType.values]: 'Giá trị cốt lõi',
  [AboutSectionType.culture]: 'Văn hóa',
  [AboutSectionType.achievement]: 'Thành tựu',
  [AboutSectionType.other]: 'Khác',
};

