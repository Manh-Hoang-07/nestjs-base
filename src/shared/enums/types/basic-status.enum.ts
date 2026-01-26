import { BasicStatus } from '@prisma/client';

/**
 * Basic Status Enum
 * Import từ Prisma
 */
export { BasicStatus };

export const BasicStatusLabels: Record<BasicStatus, string> = {
  [BasicStatus.active]: 'Hoạt động',
  [BasicStatus.inactive]: 'Ngừng hoạt động',
};



