import { Gender } from '@prisma/client';

/**
 * Gender Enum
 * Import từ Prisma
 */
export { Gender };

export const GenderLabels: Record<Gender, string> = {
  [Gender.male]: 'Nam',
  [Gender.female]: 'Nữ',
  [Gender.other]: 'Khác',
};



