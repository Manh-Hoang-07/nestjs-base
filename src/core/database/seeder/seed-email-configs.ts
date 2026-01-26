import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedEmailConfigs {
  private readonly logger = new Logger(SeedEmailConfigs.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding email configs...');

    // Check if email config already exist
    const existing = await this.prisma.emailConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    if (existing) {
      this.logger.log('Email config already exists. Skipping seeding.');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    // Hash default password
    // const defaultPassword = await bcrypt.hash('default_password', 10);

    await this.prisma.emailConfig.create({
      data: {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: true,
        smtp_username: 'test@gmail.com',
        smtp_password: 'wxqmolbvransywhq',
        from_email: 'noreply@example.com',
        from_name: 'My Website',
        reply_to_email: 'test@gmail.com',
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      },
    });
    this.logger.log('Email config seeding completed.');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing email configs...');
    await this.prisma.emailConfig.deleteMany({});
  }
}
