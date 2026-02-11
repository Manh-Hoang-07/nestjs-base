export enum MenuType {
  route = 'route',
  group = 'group',
  link = 'link',
}

/**
 * Labels cho MenuType
 */
export const MenuTypeLabels: Record<MenuType, string> = {
  [MenuType.route]: 'Route',
  [MenuType.group]: 'Group',
  [MenuType.link]: 'Link',
};



