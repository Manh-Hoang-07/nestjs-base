import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { UserStatus } from '@/shared/enums/types/user-status.enum';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedUsers {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
    const usersData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'users.json'), 'utf8'));

    const hashedPassword = await bcrypt.hash('12345678', 10);

    for (const userData of usersData) {
      let user = await this.prisma.user.findFirst({ where: { email: userData.email } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            status: userData.status as UserStatus,
            email_verified_at: new Date(),
          },
        });
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword, status: userData.status as UserStatus },
        });
      }

      if (userData.group_code && userData.role_code) {
        await this.assignUserToGroup(user, userData.group_code, userData.role_code);
      }
    }

    const systemAdmin = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    if (systemAdmin) {
      const systemGroup = await this.prisma.group.findFirst({ where: { code: 'system' } });
      if (systemGroup && Number(systemGroup.owner_id) !== Number(systemAdmin.id)) {
        await this.prisma.group.update({ where: { id: systemGroup.id }, data: { owner_id: systemAdmin.id } });
      }
    }
  }

  private async assignUserToGroup(user: any, groupCode: string, roleCode: string): Promise<void> {
    const [group, role] = await Promise.all([
      this.prisma.group.findFirst({ where: { code: groupCode } }),
      this.prisma.role.findFirst({ where: { code: roleCode } }),
    ]);
    if (!group || !role) return;

    await this.prisma.userGroup.upsert({
      where: { user_id_group_id: { user_id: user.id, group_id: group.id } },
      update: {},
      create: { user_id: user.id, group_id: group.id, joined_at: new Date() },
    });

    await this.prisma.userRoleAssignment.upsert({
      where: { user_id_role_id_group_id: { user_id: user.id, role_id: role.id, group_id: group.id } },
      update: {},
      create: { user_id: user.id, role_id: role.id, group_id: group.id },
    });
  }

  async clear(): Promise<void> {
    await this.prisma.user.deleteMany({});
  }
}
