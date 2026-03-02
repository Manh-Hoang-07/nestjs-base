import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedPermissions {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? adminUser.id : BigInt(1);

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
    const permissions: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'permissions.json'), 'utf8'));

    const createdPermissions: Map<string, any> = new Map();
    const sortedPermissions = this.sortPermissionsByParent(permissions);

    for (const permData of sortedPermissions) {
      let parentPermission: any | null = null;
      if (permData.parent_code) {
        parentPermission = createdPermissions.get(permData.parent_code) || null;
        if (!parentPermission) {
          parentPermission = await this.prisma.permission.findFirst({ where: { code: permData.parent_code } });
        }
      }

      const scope = permData.code.startsWith('system.') ? 'system' : 'context';

      const saved = await this.prisma.permission.upsert({
        where: { code: permData.code },
        update: {
          name: permData.name,
          status: permData.status,
          scope: scope,
          parent_id: parentPermission ? parentPermission.id : null,
          updated_user_id: defaultUserId,
        },
        create: {
          code: permData.code,
          name: permData.name,
          status: permData.status,
          scope: scope,
          parent_id: parentPermission ? parentPermission.id : null,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });
      createdPermissions.set(saved.code, saved);
    }
  }

  private sortPermissionsByParent(permissions: Array<any>): Array<any> {
    const result: Array<any> = [];
    const processed = new Set<string>();

    for (const perm of permissions) {
      if (!perm.parent_code) {
        result.push(perm);
        processed.add(perm.code);
      }
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const perm of permissions) {
        if (!processed.has(perm.code)) {
          if (!perm.parent_code || processed.has(perm.parent_code)) {
            result.push(perm);
            processed.add(perm.code);
            changed = true;
          }
        }
      }
    }
    return result;
  }

  async clear(): Promise<void> {
    await this.prisma.permission.deleteMany({});
  }
}

