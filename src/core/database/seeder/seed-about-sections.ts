import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { StringUtil } from '@/core/utils/string.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedAboutSections {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.aboutSection.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'content');
    const sections: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'about-sections.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : null;

    for (const section of sections) {
      await this.prisma.aboutSection.create({
        data: {
          ...section,
          slug: StringUtil.toSlug(section.title),
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.aboutSection.deleteMany({});
  }
}
