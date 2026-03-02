import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedComicCategories {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    const existingCategories = await this.prisma.comicCategory.count();
    if (existingCategories > 0) return;

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? adminUser.id : BigInt(1);

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
    const categoriesData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'comic-categories.json'), 'utf8'));

    const systemGroup = await this.prisma.group.findFirst({ where: { code: 'system' } });
    const groupId = systemGroup ? systemGroup.id : null;

    for (const categoryData of categoriesData) {
      await this.prisma.comicCategory.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          group_id: groupId,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.comicCategory.deleteMany({});
  }
}




