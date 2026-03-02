import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedCertificates {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.certificate.count() > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'content');
    const certificates: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'certificates.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
    const defaultUserId = adminUser ? BigInt(adminUser.id) : null;

    for (const cert of certificates) {
      await this.prisma.certificate.create({
        data: {
          ...cert,
          issued_date: new Date(cert.issued_date),
          expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        } as any,
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.certificate.deleteMany({});
  }
}
