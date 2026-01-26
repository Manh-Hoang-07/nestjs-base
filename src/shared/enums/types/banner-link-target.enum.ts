/**
 * Banner Link Target Enum
 * Không có trong Prisma schema, giữ lại như enum riêng
 */
export enum BannerLinkTarget {
  SELF = '_self',
  BLANK = '_blank',
}

export const BannerLinkTargetLabels: Record<BannerLinkTarget, string> = {
  [BannerLinkTarget.SELF]: 'Cùng tab',
  [BannerLinkTarget.BLANK]: 'Tab mới',
};

