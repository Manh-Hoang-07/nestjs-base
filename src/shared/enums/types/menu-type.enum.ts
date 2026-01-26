import { MenuType } from '@prisma/client';

/**
 * Menu Type Enum
 * Import từ Prisma
 */
export { MenuType };

/**
 * Labels cho MenuType
 */
export const MenuTypeLabels: Record<MenuType, string> = {
  [MenuType.route]: 'Route',
  [MenuType.group]: 'Group',
  [MenuType.link]: 'Link',
};

