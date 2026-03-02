import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedGeneralConfigs {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.generalConfig.findFirst()) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
    const configData: any = JSON.parse(fs.readFileSync(path.join(baseDir, 'general-configs.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : 1;

    await this.prisma.generalConfig.create({
      data: {
        ...configData,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      },
    });
  }

  async clear(): Promise<void> {
    await this.prisma.generalConfig.deleteMany({});
  }
}
