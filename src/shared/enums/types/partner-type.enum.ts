import { PartnerType } from '@prisma/client';

/**
 * Partner Type Enum
 * Import từ Prisma
 */
export { PartnerType };

export const PartnerTypeLabels: Record<PartnerType, string> = {
  [PartnerType.client]: 'Khách hàng',
  [PartnerType.supplier]: 'Nhà cung cấp',
  [PartnerType.partner]: 'Đối tác',
};

