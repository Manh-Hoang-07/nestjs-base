import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedContacts {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.contact.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
    const contacts: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'contacts.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    for (const data of contacts) {
      await this.prisma.contact.create({
        data: {
          ...data,
          replied_at: data.reply ? new Date() : null,
          replied_by: data.reply ? defaultUserId : null,
        } as any,
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.contact.deleteMany({});
  }
}
