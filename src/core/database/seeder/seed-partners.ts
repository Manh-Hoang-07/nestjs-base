import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PartnerType } from '@/shared/enums/types/partner-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedPartners {
  private readonly logger = new Logger(SeedPartners.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding partners...');

    const existingCount = await this.prisma.partner.count();
    if (existingCount > 0) {
      this.logger.log(`Partners already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : null;

    const partners = [
      // Clients
      {
        name: 'Công ty TNHH ABC',
        logo: '/uploads/partners/client-abc.png',
        website: 'https://www.abc-company.com',
        description: 'Đối tác chiến lược lâu năm, đã hợp tác trong nhiều dự án lớn',
        type: PartnerType.client,
        status: BasicStatus.active,
        sort_order: 1,
      },
      {
        name: 'Tập đoàn XYZ',
        logo: '/uploads/partners/client-xyz.png',
        website: 'https://www.xyz-group.com',
        description: 'Tập đoàn hàng đầu trong lĩnh vực bất động sản',
        type: PartnerType.client,
        status: BasicStatus.active,
        sort_order: 2,
      },
      {
        name: 'Công ty Cổ phần DEF',
        logo: '/uploads/partners/client-def.png',
        website: 'https://www.def-corp.com',
        description: 'Đối tác uy tín trong các dự án thương mại',
        type: PartnerType.client,
        status: BasicStatus.active,
        sort_order: 3,
      },
      // Suppliers
      {
        name: 'Công ty Vật liệu Xây dựng GHI',
        logo: '/uploads/partners/supplier-ghi.png',
        website: 'https://www.ghi-materials.com',
        description: 'Nhà cung cấp vật liệu xây dựng chất lượng cao',
        type: PartnerType.supplier,
        status: BasicStatus.active,
        sort_order: 4,
      },
      {
        name: 'Công ty Thiết bị Xây dựng JKL',
        logo: '/uploads/partners/supplier-jkl.png',
        website: 'https://www.jkl-equipment.com',
        description: 'Cung cấp thiết bị và máy móc xây dựng',
        type: PartnerType.supplier,
        status: BasicStatus.active,
        sort_order: 5,
      },
      {
        name: 'Công ty Thép MNO',
        logo: '/uploads/partners/supplier-mno.png',
        website: 'https://www.mno-steel.com',
        description: 'Nhà cung cấp thép xây dựng hàng đầu',
        type: PartnerType.supplier,
        status: BasicStatus.active,
        sort_order: 6,
      },
      // Partners
      {
        name: 'Ngân hàng PQR',
        logo: '/uploads/partners/partner-pqr.png',
        website: 'https://www.pqr-bank.com',
        description: 'Đối tác tài chính, hỗ trợ vốn cho các dự án',
        type: PartnerType.partner,
        status: BasicStatus.active,
        sort_order: 7,
      },
      {
        name: 'Công ty Tư vấn Thiết kế STU',
        logo: '/uploads/partners/partner-stu.png',
        website: 'https://www.stu-design.com',
        description: 'Đối tác tư vấn thiết kế và kiến trúc',
        type: PartnerType.partner,
        status: BasicStatus.active,
        sort_order: 8,
      },
    ];

    for (const partner of partners) {
      await this.prisma.partner.create({
        data: {
          ...partner,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
    }

    // ========== SEED ADDITIONAL RANDOM PARTNERS ==========
    this.logger.log('Seeding additional random partners...');
    const randomPartnerCount = 40;
    const partnerTypes = [PartnerType.client, PartnerType.supplier, PartnerType.partner];

    for (let i = 1; i <= randomPartnerCount; i++) {
      const name = `Đối tác mẫu ${i}`;
      const type = partnerTypes[i % partnerTypes.length];

      await this.prisma.partner.create({
        data: {
          name: name,
          logo: `/uploads/partners/demo-${(i % 5) + 1}.png`,
          website: `https://partner${i}.com`,
          description: `Mô tả ngắn về đối tác mẫu số ${i}. Hợp tác trong lĩnh vực cung cấp vật tư và thi công.`,
          type: type,
          status: BasicStatus.active,
          sort_order: 10 + i,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        }
      });

      this.logger.log(`Created random partner ${i}: ${name}`);
    }

    this.logger.log(`Seeded ${partners.length} partners successfully`);
  }
}

