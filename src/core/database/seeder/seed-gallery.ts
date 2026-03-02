import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { StringUtil } from '@/core/utils/string.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedGallery {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.gallery.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'content');
    const galleries: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'gallery.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : null;

    for (const gallery of galleries) {
      await this.prisma.gallery.create({
        data: {
          ...gallery,
          slug: StringUtil.toSlug(gallery.title),
          images: JSON.stringify(gallery.images),
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        } as any,
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.gallery.deleteMany({});
  }
}
