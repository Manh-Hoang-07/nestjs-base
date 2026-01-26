import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { CertificateType } from '@/shared/enums/types/certificate-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedCertificates {
  private readonly logger = new Logger(SeedCertificates.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding certificates...');

    const existingCount = await this.prisma.certificate.count();
    if (existingCount > 0) {
      this.logger.log(`Certificates already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : null;

    const certificates = [
      {
        name: 'Chứng nhận ISO 9001:2015',
        image: '/uploads/certificates/iso-9001-2015.jpg',
        issued_by: 'Tổ chức Chứng nhận Quốc tế',
        issued_date: new Date('2020-03-15'),
        expiry_date: new Date('2026-03-15'),
        certificate_number: 'ISO-9001-2020-001',
        description: 'Chứng nhận hệ thống quản lý chất lượng theo tiêu chuẩn ISO 9001:2015',
        type: CertificateType.iso,
        status: BasicStatus.active,
        sort_order: 1,
      },
      {
        name: 'Chứng nhận ISO 14001:2015',
        image: '/uploads/certificates/iso-14001-2015.jpg',
        issued_by: 'Tổ chức Chứng nhận Quốc tế',
        issued_date: new Date('2021-06-20'),
        expiry_date: new Date('2027-06-20'),
        certificate_number: 'ISO-14001-2021-001',
        description: 'Chứng nhận hệ thống quản lý môi trường theo tiêu chuẩn ISO 14001:2015',
        type: CertificateType.iso,
        status: BasicStatus.active,
        sort_order: 2,
      },
      {
        name: 'Giải thưởng Nhà thầu Xây dựng Xuất sắc',
        image: '/uploads/certificates/award-excellent-contractor.jpg',
        issued_by: 'Hiệp hội Xây dựng Việt Nam',
        issued_date: new Date('2015-12-10'),
        expiry_date: null,
        certificate_number: 'Award-2015-001',
        description: 'Giải thưởng Nhà thầu Xây dựng Xuất sắc năm 2015',
        type: CertificateType.award,
        status: BasicStatus.active,
        sort_order: 3,
      },
      {
        name: 'Giấy phép Hành nghề Xây dựng Hạng I',
        image: '/uploads/certificates/license-grade-1.jpg',
        issued_by: 'Bộ Xây dựng',
        issued_date: new Date('2018-01-15'),
        expiry_date: new Date('2028-01-15'),
        certificate_number: 'GP-XD-H1-2018-001',
        description: 'Giấy phép hành nghề xây dựng hạng I - được phép thi công các công trình cấp đặc biệt và cấp I',
        type: CertificateType.license,
        status: BasicStatus.active,
        sort_order: 4,
      },
      {
        name: 'Chứng nhận LEED Gold',
        image: '/uploads/certificates/leed-gold.jpg',
        issued_by: 'U.S. Green Building Council',
        issued_date: new Date('2023-05-20'),
        expiry_date: null,
        certificate_number: 'LEED-GOLD-2023-001',
        description: 'Chứng nhận công trình xanh LEED Gold cho dự án Khu đô thị sinh thái Green Valley',
        type: CertificateType.certification,
        status: BasicStatus.active,
        sort_order: 5,
      },
      {
        name: 'Top 10 Công ty Xây dựng Uy tín',
        image: '/uploads/certificates/top-10-reputable.jpg',
        issued_by: 'Tạp chí Xây dựng Việt Nam',
        issued_date: new Date('2022-11-15'),
        expiry_date: null,
        certificate_number: 'Top10-2022-001',
        description: 'Vinh danh trong Top 10 công ty xây dựng uy tín nhất Việt Nam năm 2022',
        type: CertificateType.award,
        status: BasicStatus.active,
        sort_order: 6,
      },
    ];

    for (const certificate of certificates) {
      await this.prisma.certificate.create({
        data: {
          ...certificate,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
    }

    // ========== SEED ADDITIONAL RANDOM CERTIFICATES ==========
    this.logger.log('Seeding additional random certificates...');
    const randomCertificateCount = 40;
    const certificateTypes = [CertificateType.iso, CertificateType.award, CertificateType.license, CertificateType.certification, CertificateType.other];

    for (let i = 1; i <= randomCertificateCount; i++) {
      const name = `Chứng chỉ mẫu ${i}`;
      const type = certificateTypes[i % certificateTypes.length];

      await this.prisma.certificate.create({
        data: {
          name: name,
          image: `/uploads/certificates/demo-${(i % 5) + 1}.jpg`,
          issued_by: `Tổ chức cấp chứng chỉ ${i}`,
          issued_date: new Date(2015 + (i % 8), (i % 12), 1),
          expiry_date: new Date(2025 + (i % 8), (i % 12), 1),
          certificate_number: `CERT-${i}`,
          description: `Mô tả ngắn gọn về chứng chỉ mẫu số ${i}. Chứng chỉ này công nhận năng lực của công ty.`,
          type: type,
          status: BasicStatus.active,
          sort_order: 10 + i,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        }
      });

      this.logger.log(`Created random certificate ${i}: ${name}`);
    }

    this.logger.log(`Seeded ${certificates.length} certificates successfully`);
  }
}

