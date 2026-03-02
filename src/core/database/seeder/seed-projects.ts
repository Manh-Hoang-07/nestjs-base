import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { StringUtil } from '@/core/utils/string.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedProjects {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.project.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'content');
    const projects: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'projects.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : null;

    for (const project of projects) {
      await this.prisma.project.create({
        data: {
          ...project,
          slug: StringUtil.toSlug(project.name),
          start_date: new Date(project.start_date),
          end_date: project.end_date ? new Date(project.end_date) : null,
          images: JSON.stringify(project.images),
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        } as any,
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.project.deleteMany({});
  }
}
