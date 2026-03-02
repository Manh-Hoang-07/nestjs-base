import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedStaff {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.staff.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'content');
    const staffMembers: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'staff.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : null;

    for (const staff of staffMembers) {
      await this.prisma.staff.create({
        data: {
          ...staff,
          social_links: JSON.stringify(staff.social_links),
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        } as any,
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.staff.deleteMany({});
  }
}
