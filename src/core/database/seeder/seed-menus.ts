import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { MenuType } from '@/shared/enums/types/menu-type.enum';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedMenus {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    await this.prisma.menuPermission.deleteMany({});
    await this.prisma.menu.deleteMany({});

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? adminUser.id : BigInt(1);

    const permissions = await this.prisma.permission.findMany();
    const permMap = new Map<string, any>();
    permissions.forEach(perm => permMap.set(perm.code, perm));

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
    const menuData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'menus.json'), 'utf8'));

    const createdMenus = new Map<string, any>();
    const sortedMenus = this.sortMenusByParent(menuData);

    for (const menuItem of sortedMenus) {
      let parent: any | null = null;
      if (menuItem.parent_code) {
        parent = createdMenus.get(menuItem.parent_code) || await this.prisma.menu.findFirst({ where: { code: menuItem.parent_code } });
      }

      let requiredPermission: any | null = null;
      if (menuItem.permission_code) {
        requiredPermission = permMap.get(menuItem.permission_code) || null;
      }

      const saved = await this.prisma.menu.create({
        data: {
          code: menuItem.code,
          name: menuItem.name,
          path: menuItem.path,
          api_path: menuItem.api_path,
          icon: menuItem.icon,
          type: menuItem.type,
          status: menuItem.status,
          parent_id: parent ? parent.id : null,
          sort_order: menuItem.sort_order,
          is_public: menuItem.is_public,
          show_in_menu: menuItem.show_in_menu,
          group: menuItem.group || 'admin',
          required_permission_id: requiredPermission ? requiredPermission.id : null,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });

      if (saved.type === MenuType.group && menuItem.permission_codes && Array.isArray(menuItem.permission_codes)) {
        for (const permCode of menuItem.permission_codes) {
          const perm = permMap.get(permCode);
          if (perm) {
            await this.prisma.menuPermission.create({
              data: { menu_id: saved.id, permission_id: perm.id },
            });
          }
        }
      }
      createdMenus.set(saved.code, saved);
    }
  }

  private sortMenusByParent(menus: Array<any>): Array<any> {
    const result: Array<any> = [];
    const processed = new Set<string>();

    for (const menu of menus) {
      if (!menu.parent_code && !menu.parent_id) {
        result.push(menu);
        processed.add(menu.code);
      }
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const menu of menus) {
        if (!processed.has(menu.code)) {
          if (!menu.parent_code || processed.has(menu.parent_code)) {
            result.push(menu);
            processed.add(menu.code);
            changed = true;
          }
        }
      }
    }
    return result;
  }

  async clear(): Promise<void> {
    await this.prisma.menuPermission.deleteMany({});
    await this.prisma.menu.deleteMany({});
  }
}

