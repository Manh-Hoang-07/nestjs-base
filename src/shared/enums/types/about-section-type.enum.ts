export enum AboutSectionType {
  history = 'history',
  mission = 'mission',
  vision = 'vision',
  values = 'values',
  culture = 'culture',
  achievement = 'achievement',
  other = 'other',
}

/**
 * About Section Type Labels
 */
export const AboutSectionTypeLabels: Record<AboutSectionType, string> = {
  [AboutSectionType.history]: 'Lịch sử',
  [AboutSectionType.mission]: 'Sứ mệnh',
  [AboutSectionType.vision]: 'Tầm nhìn',
  [AboutSectionType.values]: 'Giá trị cốt lõi',
  [AboutSectionType.culture]: 'Văn hóa',
  [AboutSectionType.achievement]: 'Thành tựu',
  [AboutSectionType.other]: 'Khác',
};



