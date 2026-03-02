import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedRoles {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
    const rolesData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'roles.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? adminUser.id : BigInt(1);

    const createdRoles: Map<string, any> = new Map();

    for (const roleData of rolesData) {
      const role = await this.prisma.role.upsert({
        where: { code: roleData.code },
        update: {
          name: roleData.name,
          status: roleData.status,
          updated_user_id: defaultUserId,
        },
        create: {
          ...roleData,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });
      createdRoles.set(role.code, role);
    }

    await this.assignPermissionsToRoles(createdRoles);
    await this.assignRolesToContexts(createdRoles);
  }

  private async assignPermissionsToRoles(createdRoles: Map<string, any>): Promise<void> {
    const allPermissions = await this.prisma.permission.findMany({ where: { status: 'active' } });

    const roleConfigs = [
      { code: 'system', filter: () => true },
      { code: 'system_manager', filter: (p: any) => !['role.manage', 'permission.manage'].includes(p.code) },
      { code: 'shop_admin', filter: (p: any) => !['role.manage', 'permission.manage', 'system.manage'].includes(p.code) },
      { code: 'shop_manager', filter: (p: any) => !['role.manage', 'permission.manage', 'system.manage', 'user.manage'].includes(p.code) },
    ];

    for (const config of roleConfigs) {
      const role = createdRoles.get(config.code);
      if (role) {
        const perms = allPermissions.filter(config.filter);
        await this.prisma.roleHasPermission.deleteMany({ where: { role_id: role.id } });
        await this.prisma.roleHasPermission.createMany({
          data: perms.map(perm => ({ role_id: role.id, permission_id: perm.id })),
        });
      }
    }
  }

  private async assignRolesToContexts(createdRoles: Map<string, any>): Promise<void> {
    const systemContext = await this.prisma.context.findFirst({ where: { code: 'system' } });
    const shopContext = await this.prisma.context.findFirst({ where: { code: 'shop' } });

    if (!systemContext) return;

    const mappings = [
      { roleCode: 'system', context: systemContext },
      { roleCode: 'system_manager', context: systemContext },
      { roleCode: 'shop_admin', context: shopContext },
      { roleCode: 'shop_manager', context: shopContext },
    ];

    for (const map of mappings) {
      const role = createdRoles.get(map.roleCode);
      if (role && map.context) {
        await this.prisma.roleContext.upsert({
          where: {
            role_id_context_id: {
              role_id: role.id,
              context_id: map.context.id,
            },
          },
          update: {},
          create: {
            role_id: role.id,
            context_id: map.context.id,
          },
        });
      }
    }
  }

  async clear(): Promise<void> {
    await this.prisma.roleHasPermission.deleteMany({});
    await this.prisma.roleContext.deleteMany({});
    await this.prisma.role.deleteMany({});
  }
}

