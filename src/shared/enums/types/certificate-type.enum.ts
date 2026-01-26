import { CertificateType } from '@prisma/client';

/**
 * Certificate Type Enum
 * Import từ Prisma
 */
export { CertificateType };

export const CertificateTypeLabels: Record<CertificateType, string> = {
  [CertificateType.iso]: 'ISO',
  [CertificateType.award]: 'Giải thưởng',
  [CertificateType.license]: 'Giấy phép',
  [CertificateType.certification]: 'Chứng nhận',
  [CertificateType.other]: 'Khác',
};

