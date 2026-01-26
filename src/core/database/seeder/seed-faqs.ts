import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedFaqs {
  private readonly logger = new Logger(SeedFaqs.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding FAQs...');

    const existingCount = await this.prisma.faq.count();
    if (existingCount > 0) {
      this.logger.log(`FAQs already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : null;

    const faqs = [
      {
        question: 'Công ty có nhận thi công các loại công trình nào?',
        answer: 'Chúng tôi nhận thi công đa dạng các loại công trình bao gồm: nhà ở dân dụng, chung cư, tòa nhà văn phòng, trung tâm thương mại, bệnh viện, trường học, nhà máy công nghiệp, và các công trình hạ tầng. Với giấy phép hành nghề hạng I, chúng tôi có thể thi công các công trình từ cấp đặc biệt đến cấp IV.',
        status: BasicStatus.active,
        sort_order: 1,
      },
      {
        question: 'Thời gian thi công một dự án thường mất bao lâu?',
        answer: 'Thời gian thi công phụ thuộc vào quy mô và độ phức tạp của dự án. Thông thường, một dự án nhà ở dân dụng có thể hoàn thành trong 6-12 tháng, chung cư cao tầng từ 18-36 tháng, và các công trình công nghiệp lớn có thể mất 24-48 tháng. Chúng tôi luôn cam kết hoàn thành đúng tiến độ đã thỏa thuận trong hợp đồng.',
        status: BasicStatus.active,
        sort_order: 2,
      },
      {
        question: 'Công ty có đảm bảo chất lượng công trình không?',
        answer: 'Có, chúng tôi cam kết đảm bảo chất lượng công trình theo đúng tiêu chuẩn và quy định hiện hành. Công ty đã đạt chứng nhận ISO 9001:2015 về quản lý chất lượng và có hệ thống kiểm soát chất lượng chặt chẽ từ khâu thiết kế đến thi công và bàn giao. Tất cả công trình đều được bảo hành theo quy định.',
        status: BasicStatus.active,
        sort_order: 3,
      },
      {
        question: 'Quy trình làm việc với khách hàng như thế nào?',
        answer: 'Quy trình làm việc của chúng tôi bao gồm các bước: (1) Tiếp nhận yêu cầu và khảo sát hiện trạng, (2) Lập phương án thiết kế và dự toán, (3) Ký kết hợp đồng, (4) Thi công theo tiến độ, (5) Nghiệm thu và bàn giao công trình, (6) Bảo hành và bảo trì. Chúng tôi luôn cập nhật tiến độ và thông báo cho khách hàng trong suốt quá trình thi công.',
        status: BasicStatus.active,
        sort_order: 4,
      },
      {
        question: 'Công ty có hỗ trợ vay vốn cho khách hàng không?',
        answer: 'Chúng tôi có quan hệ đối tác với nhiều ngân hàng uy tín và có thể hỗ trợ khách hàng trong việc tư vấn và kết nối với các ngân hàng để vay vốn xây dựng. Tuy nhiên, việc phê duyệt khoản vay phụ thuộc vào điều kiện và chính sách của từng ngân hàng.',
        status: BasicStatus.active,
        sort_order: 5,
      },
      {
        question: 'Công ty có thi công ở các tỉnh thành khác không?',
        answer: 'Hiện tại, chúng tôi có trụ sở chính tại TP.HCM và các chi nhánh tại Hà Nội và Đà Nẵng. Chúng tôi nhận thi công các dự án trên toàn quốc, đặc biệt là các tỉnh thành phía Nam và miền Trung. Đối với các dự án ở xa, chúng tôi sẽ cử đội ngũ kỹ thuật và quản lý dự án đến hiện trường để đảm bảo chất lượng thi công.',
        status: BasicStatus.active,
        sort_order: 6,
      },
      {
        question: 'Làm thế nào để nhận báo giá chi tiết cho dự án?',
        answer: 'Quý khách có thể liên hệ với chúng tôi qua hotline, email hoặc form liên hệ trên website. Sau khi nhận được thông tin về dự án, chúng tôi sẽ cử kỹ sư đến khảo sát hiện trạng và lập báo giá chi tiết trong vòng 3-5 ngày làm việc. Báo giá sẽ bao gồm đầy đủ các hạng mục, vật liệu, nhân công và thời gian thi công.',
        status: BasicStatus.active,
        sort_order: 7,
      },
      {
        question: 'Công ty có chính sách bảo hành như thế nào?',
        answer: 'Chúng tôi cam kết bảo hành công trình theo quy định của pháp luật. Thông thường, thời gian bảo hành là 12 tháng đối với các hạng mục hoàn thiện và 24 tháng đối với phần kết cấu. Trong thời gian bảo hành, chúng tôi sẽ miễn phí sửa chữa các lỗi do thi công. Chúng tôi cũng có dịch vụ bảo trì định kỳ cho khách hàng có nhu cầu.',
        status: BasicStatus.active,
        sort_order: 8,
      },
      {
        question: 'Công ty có áp dụng công nghệ xây dựng hiện đại không?',
        answer: 'Có, chúng tôi luôn cập nhật và áp dụng các công nghệ xây dựng hiện đại như BIM (Building Information Modeling), công nghệ bê tông cốt thép tiền chế, hệ thống quản lý dự án thông minh, và các giải pháp xây dựng xanh, tiết kiệm năng lượng. Chúng tôi cũng đầu tư vào máy móc thiết bị hiện đại để nâng cao hiệu quả và chất lượng thi công.',
        status: BasicStatus.active,
        sort_order: 9,
      },
      {
        question: 'Làm sao để đảm bảo an toàn lao động trong quá trình thi công?',
        answer: 'An toàn lao động là ưu tiên hàng đầu của chúng tôi. Chúng tôi có hệ thống quản lý an toàn lao động chặt chẽ, tuân thủ đầy đủ các quy định về an toàn. Tất cả công nhân đều được đào tạo về an toàn lao động và trang bị đầy đủ thiết bị bảo hộ. Chúng tôi cũng có đội ngũ giám sát an toàn tại công trường và thực hiện kiểm tra định kỳ.',
        status: BasicStatus.active,
        sort_order: 10,
      },
    ];

    for (const faq of faqs) {
      await this.prisma.faq.create({
        data: {
          ...faq,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
    }

    this.logger.log(`Seeded ${faqs.length} FAQs successfully`);
  }
}

