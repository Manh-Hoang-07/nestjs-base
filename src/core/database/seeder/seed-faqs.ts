import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedFaqs {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.faq.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
    const faqs: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'faqs.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : null;

    for (const faq of faqs) {
      await this.prisma.faq.create({
        data: {
          ...faq,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.faq.deleteMany({});
  }
}
