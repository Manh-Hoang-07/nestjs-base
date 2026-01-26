import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedTestimonials {
  private readonly logger = new Logger(SeedTestimonials.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding testimonials...');

    const existingCount = await this.prisma.testimonial.count();
    if (existingCount > 0) {
      this.logger.log(`Testimonials already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : null;

    // Get some projects for linking
    const projects = await this.prisma.project.findMany({ take: 3 });
    const projectIds = projects.map(p => Number(p.id));

    const testimonials = [
      {
        client_name: 'Ông Nguyễn Văn A',
        client_position: 'Giám đốc Điều hành',
        client_company: 'Công ty TNHH ABC',
        client_avatar: '/uploads/testimonials/client-1.jpg',
        content: 'Chúng tôi rất hài lòng với chất lượng công trình và thái độ làm việc chuyên nghiệp của đội ngũ. Dự án được hoàn thành đúng tiến độ và vượt quá mong đợi về chất lượng.',
        rating: 5,
        project_id: projectIds[0] || null,
        featured: true,
        status: BasicStatus.active,
        sort_order: 1,
      },
      {
        client_name: 'Bà Trần Thị B',
        client_position: 'Chủ tịch HĐQT',
        client_company: 'Tập đoàn XYZ',
        client_avatar: '/uploads/testimonials/client-2.jpg',
        content: 'Công ty Xây Dựng ABC đã chứng minh được năng lực và uy tín của mình. Dự án Khu đô thị sinh thái Green Valley được thi công rất chuyên nghiệp, đảm bảo chất lượng và an toàn.',
        rating: 5,
        project_id: projectIds[1] || null,
        featured: true,
        status: BasicStatus.active,
        sort_order: 2,
      },
      {
        client_name: 'Ông Lê Văn C',
        client_position: 'Tổng Giám đốc',
        client_company: 'Công ty Cổ phần DEF',
        client_avatar: '/uploads/testimonials/client-3.jpg',
        content: 'Đội ngũ kỹ thuật rất tận tâm và có trách nhiệm. Họ luôn sẵn sàng giải đáp mọi thắc mắc và đưa ra những giải pháp tối ưu cho dự án. Chúng tôi sẽ tiếp tục hợp tác trong tương lai.',
        rating: 5,
        project_id: projectIds[2] || null,
        featured: true,
        status: BasicStatus.active,
        sort_order: 3,
      },
      {
        client_name: 'Bà Phạm Thị D',
        client_position: 'Giám đốc Dự án',
        client_company: 'Công ty TNHH GHI',
        client_avatar: '/uploads/testimonials/client-4.jpg',
        content: 'Dự án bệnh viện được thi công rất cẩn thận, đảm bảo các tiêu chuẩn y tế. Đội ngũ thi công rất chuyên nghiệp và tuân thủ nghiêm ngặt các quy định về an toàn.',
        rating: 5,
        project_id: null,
        featured: false,
        status: BasicStatus.active,
        sort_order: 4,
      },
      {
        client_name: 'Ông Hoàng Văn E',
        client_position: 'Giám đốc Sản xuất',
        client_company: 'Công ty Cổ phần MNO',
        client_avatar: '/uploads/testimonials/client-5.jpg',
        content: 'Nhà máy sản xuất được xây dựng đúng tiến độ, chất lượng tốt. Công ty đã hỗ trợ chúng tôi rất nhiều trong quá trình thi công và bàn giao công trình.',
        rating: 4,
        project_id: null,
        featured: false,
        status: BasicStatus.active,
        sort_order: 5,
      },
    ];

    for (const testimonial of testimonials) {
      await this.prisma.testimonial.create({
        data: {
          ...testimonial,
          project_id: testimonial.project_id ? BigInt(testimonial.project_id) : null,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
    }

    // ========== SEED ADDITIONAL RANDOM TESTIMONIALS ==========
    this.logger.log('Seeding additional random testimonials...');
    const randomTestimonialCount = 40;
    const clientPositions = ['Giám đốc', 'Trưởng phòng', 'Kỹ sư', 'Chủ đầu tư', 'Quản lý dự án'];
    const clientCompanies = ['Công ty A', 'Công ty B', 'Tập đoàn C', 'Công ty Xây dựng D', 'Doanh nghiệp E'];

    for (let i = 1; i <= randomTestimonialCount; i++) {
      const clientName = `Khách hàng mẫu ${i}`;

      await this.prisma.testimonial.create({
        data: {
          client_name: clientName,
          client_position: clientPositions[i % clientPositions.length],
          client_company: clientCompanies[i % clientCompanies.length],
          client_avatar: `/uploads/testimonials/demo-${(i % 5) + 1}.jpg`,
          content: `Đây là ý kiến đánh giá mẫu số ${i}. Chúng tôi rất hài lòng về dịch vụ và chất lượng công trình. Đội ngũ nhân viên chuyên nghiệp và tận tâm.`,
          rating: 4 + (i % 2), // 4 or 5
          project_id: null,
          featured: i % 5 === 0,
          status: BasicStatus.active,
          sort_order: 10 + i,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        }
      });

      this.logger.log(`Created random testimonial ${i}: ${clientName}`);
    }

    this.logger.log(`Seeded ${testimonials.length} testimonials successfully`);
  }
}

