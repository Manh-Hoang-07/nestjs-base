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
    userId?: number | bigint,
    filters: MenuFilter = {}
  ): Promise<MenuTreeItem[]> {
    const group = filters.group || 'admin';

    // 1. Lọc dữ liệu từ Repo - Database đã lọc theo group và status
    const dbFilter: MenuFilter = {
      ...filters,
      group: group,
      status: BasicStatus.active,
    };

    const allMenus = await this.menuRepo.findAllWithChildren(dbFilter);
    const menus = (allMenus as any[]).filter(m => m.show_in_menu);

    if (!menus.length) return [];

    // 2. Lọc theo quyền dựa trên loại menu
    let filteredMenus: any[];
    if (group === 'client') {
      // Menu client: Chỉ check public hoặc đã đăng nhập
      filteredMenus = this.filterClientMenus(menus, userId);
    } else {
      // Menu admin: Check quyền RBAC đầy đủ
      filteredMenus = await this.filterAdminMenus(menus, userId);
    }

    // 3. Xây dựng cấu trúc cây
    return this.buildTree(filteredMenus);
  }

  /**
   * Logic lọc menu dành cho Website (Client)
   */
  private filterClientMenus(menus: any[], userId?: number | bigint): any[] {
    return menus.filter((menu) => {
      if (menu.is_public) return true; // Menu công khai
      if (userId) return true;        // Menu yêu cầu đăng nhập cơ bản
      return false;
    });
  }

  /**
   * Logic lọc menu dành cho Dashboard (Admin)
   */
  private async filterAdminMenus(menus: any[], userId?: number | bigint): Promise<any[]> {
    if (!userId) return []; // Admin menu bắt buộc phải đăng nhập

    const groupId = RequestContext.get<number | null>('groupId');
    const contextType = RequestContext.get<any>('context')?.type || 'system';

    // Lấy danh sách tất cả các permission code cần check từ danh sách menus
    const requiredPerms = this.getPermissionsFromMenus(menus);
    const userPerms = new Set<string>();

    // Kiểm tra quyền của User
    for (const perm of requiredPerms) {
      const hasPerm = await this.rbacService.userHasPermissionsInGroup(userId as number, groupId ?? null, [perm]);
      if (hasPerm) userPerms.add(perm);
    }

    // Lọc menu theo quyền đã check
    let filtered = menus.filter((menu) => {
      if (menu.is_public) return true;
      if (!menu.required_permission_id && (!menu.menu_permissions || menu.menu_permissions.length === 0)) return true;

      // Check quyền chính
      if (menu.required_permission?.code && userPerms.has(menu.required_permission.code)) return true;

      // Check các quyền phụ trợ (nếu có)
      if (menu.menu_permissions?.length) {
        return menu.menu_permissions.some((mp: any) => mp.permission?.code && userPerms.has(mp.permission.code));
      }

      return false;
    });

    // Lọc bỏ menu đặc thù hệ thống nếu không phải context 'system'
    if (contextType !== 'system') {
      const systemOnlyCodes = ['roles', 'permissions', 'groups', 'contexts', 'config-general', 'config-email', 'rbac-management', 'config-management'];
      filtered = filtered.filter(m => !systemOnlyCodes.includes(m.code));
    }

    return filtered;
  }

  /**
   * Thu thập tập hợp các Permission Code duy nhất từ danh sách Menu
   */
  private getPermissionsFromMenus(menus: any[]): Set<string> {
    const codes = new Set<string>();
    menus.forEach(m => {
      if (m.required_permission?.code) codes.add(m.required_permission.code);
      if (m.menu_permissions?.length) {
        m.menu_permissions.forEach((mp: any) => {
          if (mp.permission?.code) codes.add(mp.permission.code);
        });
      }
    });
    return codes;
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
        is_public: !!menu.is_public,
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
