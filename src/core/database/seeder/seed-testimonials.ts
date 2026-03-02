import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedTestimonials {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.testimonial.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'content');
    const testimonials: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'testimonials.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : null;

    const projects = await this.prisma.project.findMany({ take: 10, orderBy: { sort_order: 'asc' } });

    for (const data of testimonials) {
      const project = data.project_index !== undefined ? (projects[data.project_index] ?? null) : null;
      const { project_index, ...rest } = data;
      await this.prisma.testimonial.create({
        data: {
          ...rest,
          project_id: project ? project.id : null,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        } as any,
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.testimonial.deleteMany({});
  }
}
