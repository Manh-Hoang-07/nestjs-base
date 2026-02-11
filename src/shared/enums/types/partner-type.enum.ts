export enum PartnerType {
  client = 'client',
  supplier = 'supplier',
  partner = 'partner',
}

/**
 * Labels cho PartnerType
 */
export const PartnerTypeLabels: Record<PartnerType, string> = {
  [PartnerType.client]: 'Khách hàng',
  [PartnerType.supplier]: 'Nhà cung cấp',
  [PartnerType.partner]: 'Đối tác',
};



