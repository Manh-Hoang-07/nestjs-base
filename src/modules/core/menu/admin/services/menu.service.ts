import { Injectable, Inject, Logger, BadRequestException, NotFoundException, forwardRef } from '@nestjs/common';
import { IMenuRepository, MENU_REPOSITORY, MenuFilter } from '@/modules/core/menu/domain/menu.repository';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { RequestContext } from '@/common/shared/utils';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { MenuTreeItem } from '@/modules/core/menu/admin/interfaces/menu-tree-item.interface';
import { BaseService } from '@/common/core/services';

@Injectable()
export class MenuService extends BaseService<any, IMenuRepository> {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepo: IMenuRepository,
    @Inject(forwardRef(() => RbacService))
    private readonly rbacService: RbacService,
  ) {
    super(menuRepo);
  }


  async getSimpleList(query: any) {
    return this.getList({
      ...query,
      limit: query.limit ?? 50,
      sort: query.sort ?? 'sort_order:ASC',
    });
  }

  /**
   * Alias for create with userId support
   */
  async createWithUser(data: any, userId?: number) {
    if (userId) data.created_user_id = userId;
    return this.create(data);
  }

  /**
   * Alias for update with userId support
   */
  async updateById(id: number, data: any, userId?: number) {
    if (userId) data.updated_user_id = userId;
    return this.update(id, data);
  }

  /**
   * Alias for delete
   */
  async deleteById(id: number) {
    return this.delete(id);
  }

  protected async beforeCreate(data: any) {
    const payload = this.preparePayload(data);

    if (payload.code) {
      const exists = await this.menuRepo.findByCode(payload.code);
      if (exists) throw new BadRequestException('Menu code already exists');
    }
    return payload;
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    const current = await this.menuRepo.findById(id);
    if (!current) throw new NotFoundException('Menu not found');

    const payload = this.preparePayload(data);

    if (payload.code && payload.code !== (current as any).code) {
      const exists = await this.menuRepo.findByCode(payload.code);
      if (exists) throw new BadRequestException('Menu code already exists');
    }
    return payload;
  }

  async getTree(): Promise<MenuTreeItem[]> {
    const menus = await this.menuRepo.findAllWithChildren();
    return this.buildTree(menus);
  }

  async getUserMenus(
    userId: number,
    options?: { include_inactive?: boolean; flatten?: boolean; contextId?: number }
  ): Promise<MenuTreeItem[]> {
    const includeInactive = options?.include_inactive || false;
    const flatten = options?.flatten || false;
    const groupId = RequestContext.get<number | null>('groupId');
    const contextType = RequestContext.get<any>('context')?.type || 'system';

    const filter: MenuFilter = {
      status: includeInactive ? undefined : BasicStatus.active
    };

    // We use findAllWithChildren here to get everything with relations
    const menus = (await this.menuRepo.findAllWithChildren(filter) as any[]).filter(m => (m as any).show_in_menu);

    if (!menus.length) return [];

    const allPerms = new Set<string>();
    const testPerms = menus
      .filter((m: any) => m.required_permission?.code || m.menu_permissions?.length)
      .flatMap((m: any) => [
        ...(m.required_permission?.code ? [m.required_permission.code] : []),
        ...(m.menu_permissions?.map((mp: any) => mp.permission?.code).filter(Boolean) || []),
      ]);

    for (const perm of new Set(testPerms)) {
      const hasPerm = await this.rbacService.userHasPermissionsInGroup(userId, groupId ?? null, [perm as string]);
      if (hasPerm) allPerms.add(perm as string);
    }

    let filteredMenus = menus.filter((menu: any) => {
      if (menu.is_public) return true;
      if (!menu.required_permission_id && !menu.required_permission) return true;
      if (menu.required_permission?.code && allPerms.has(menu.required_permission.code)) return true;
      if (menu.menu_permissions?.length) {
        return menu.menu_permissions.some((mp: any) => mp.permission?.code && allPerms.has(mp.permission.code));
      }
      return false;
    });

    if (contextType !== 'system') {
      const systemOnlyPermissions = ['role.manage', 'permission.manage', 'group.manage', 'system.manage', 'config.manage'];
      const systemOnlyMenuCodes = ['roles', 'permissions', 'groups', 'contexts', 'config-general', 'config-email', 'rbac-management', 'config-management'];

      filteredMenus = filteredMenus.filter((menu: any) => {
        if (menu.required_permission?.code && systemOnlyPermissions.includes(menu.required_permission.code as string)) return false;
        if (systemOnlyMenuCodes.includes(menu.code as string)) return false;
        return true;
      });
    }

    const tree = this.buildTree(filteredMenus);
    return flatten ? this.flattenTree(tree) : tree;
  }

  private preparePayload(data: any): any {
    const payload = { ...data };
    if (payload.parent_id !== undefined) payload.parent_id = this.toBigInt(payload.parent_id);
    if (payload.required_permission_id !== undefined) payload.required_permission_id = this.toBigInt(payload.required_permission_id);
    if (payload.created_user_id !== undefined) payload.created_user_id = this.toBigInt(payload.created_user_id);
    if (payload.updated_user_id !== undefined) payload.updated_user_id = this.toBigInt(payload.updated_user_id);
    return payload;
  }

  private toBigInt(value?: any): bigint | null {
    if (value === null || value === undefined || value === '') return null;
    return BigInt(value);
  }

  private buildTree(menus: any[]): MenuTreeItem[] {
    const menuMap = new Map<number, MenuTreeItem>();
    const rootMenus: MenuTreeItem[] = [];

    menus.forEach((menu: any) => {
      const menuId = Number(menu.id);
      menuMap.set(menuId, {
        id: menuId,
        code: menu.code as string,
        name: menu.name as string,
        path: menu.path as string | null,
        icon: menu.icon as string | null,
        type: menu.type as string,
        status: menu.status as string,
        children: [],
        allowed: true,
      });
    });

    menus.forEach((menu: any) => {
      const menuId = Number(menu.id);
      const item = menuMap.get(menuId)!;
      const parentId = menu.parent_id ? Number(menu.parent_id) : null;
      if (parentId && menuMap.has(parentId)) {
        menuMap.get(parentId)!.children!.push(item);
      } else {
        rootMenus.push(item);
      }
    });

    const sortTree = (items: MenuTreeItem[]) => {
      items.sort((a, b) => {
        const menuA = menus.find((m: any) => Number(m.id) === a.id);
        const menuB = menus.find((m: any) => Number(m.id) === b.id);
        return (menuA?.sort_order || 0) - (menuB?.sort_order || 0);
      });
      items.forEach(item => item.children && sortTree(item.children));
    };

    sortTree(rootMenus);
    return rootMenus;
  }

  private flattenTree(tree: MenuTreeItem[]): MenuTreeItem[] {
    const result: MenuTreeItem[] = [];
    const traverse = (items: MenuTreeItem[]) => {
      items.forEach(item => {
        result.push({ ...item, children: undefined });
        if (item.children?.length) traverse(item.children);
      });
    };
    traverse(tree);
    return result;
  }

  protected transform(entity: any): any {
    if (!entity) return entity;
    const converted = super.transform(entity) as any;

    if (converted.menu_permissions) {
      converted.menu_permissions = converted.menu_permissions.map((mp: any) => ({
        ...mp,
        id: mp.id ? Number(mp.id) : mp.id,
        menu_id: mp.menu_id ? Number(mp.menu_id) : mp.menu_id,
        permission_id: mp.permission_id ? Number(mp.permission_id) : mp.permission_id,
      }));
    }
    return converted;
  }
}
