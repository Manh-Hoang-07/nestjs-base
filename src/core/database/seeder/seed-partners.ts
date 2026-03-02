import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedPartners {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.partner.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'content');
    const partners: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'partners.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : null;

    for (const partner of partners) {
      await this.prisma.partner.create({
        data: {
          ...partner,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.partner.deleteMany({});
  }
}
