import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ContactStatus } from '@/shared/enums/types/contact-status.enum';

@Injectable()
export class SeedContacts {
  private readonly logger = new Logger(SeedContacts.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding contacts...');

    // Check if contacts already exist
    const existingCount = await this.prisma.contact.count();
    if (existingCount > 0) {
      this.logger.log(`Contacts already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    // Get admin user for audit fields
    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    const contacts = [
      {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        subject: 'Câu hỏi về sản phẩm',
        message: 'Tôi muốn biết thêm thông tin về sản phẩm này. Có thể tư vấn cho tôi không?',
        status: ContactStatus.Pending,
      },
      {
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0909876543',
        subject: 'Yêu cầu hỗ trợ',
        message: 'Tôi gặp vấn đề với đơn hàng của mình. Mã đơn hàng là #12345. Vui lòng liên hệ lại.',
        status: ContactStatus.Read,
      },
      {
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0912345678',
        subject: 'Góp ý cải thiện dịch vụ',
        message: 'Tôi muốn góp ý về việc cải thiện dịch vụ giao hàng. Thời gian giao hàng có thể nhanh hơn không?',
        status: ContactStatus.Replied,
        reply: 'Cảm ơn bạn đã góp ý. Chúng tôi sẽ xem xét và cải thiện dịch vụ giao hàng trong thời gian tới.',
      },
      {
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0923456789',
        subject: 'Đăng ký nhận bản tin',
        message: 'Tôi muốn đăng ký nhận bản tin về các chương trình khuyến mãi mới nhất.',
        status: ContactStatus.Closed,
        reply: 'Cảm ơn bạn đã quan tâm. Chúng tôi đã đăng ký email của bạn vào danh sách nhận bản tin.',
      },
      {
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        subject: 'Liên hệ hợp tác',
        message: 'Công ty chúng tôi muốn hợp tác với bạn về việc phân phối sản phẩm. Vui lòng liên hệ lại qua email hoặc số điện thoại.',
        status: ContactStatus.Pending,
      },
    ];

    for (const contactData of contacts) {
      await this.prisma.contact.create({
        data: {
          ...contactData,
          replied_at: contactData.reply ? new Date() : null,
          replied_by: contactData.reply ? defaultUserId : null,
        },
      });
      this.logger.log(`Created contact: ${contactData.name} (${contactData.email})`);
    }

    this.logger.log(`Contacts seeding completed. Created ${contacts.length} contacts.`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing contacts...');
    await this.prisma.contact.deleteMany({});
  }
}

