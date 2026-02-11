export enum CertificateType {
  iso = 'iso',
  award = 'award',
  license = 'license',
  certification = 'certification',
  other = 'other',
}

/**
 * Certificate Type Labels
 */
export const CertificateTypeLabels: Record<CertificateType, string> = {
  [CertificateType.iso]: 'ISO',
  [CertificateType.award]: 'Giải thưởng',
  [CertificateType.license]: 'Giấy phép',
  [CertificateType.certification]: 'Chứng nhận',
  [CertificateType.other]: 'Khác',
};



