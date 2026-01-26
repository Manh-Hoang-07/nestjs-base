import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { AboutSectionType } from '@/shared/enums/types/about-section-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class SeedAboutSections {
  private readonly logger = new Logger(SeedAboutSections.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding about sections...');

    const existingCount = await this.prisma.aboutSection.count();
    if (existingCount > 0) {
      this.logger.log(`About sections already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : null;

    const sections = [
      {
        title: 'Lịch sử hình thành',
        content: `<p>Công ty Xây Dựng ABC được thành lập vào năm 2010 với sứ mệnh mang đến những công trình xây dựng chất lượng cao, đáp ứng nhu cầu ngày càng tăng của thị trường bất động sản Việt Nam.</p>
        <p>Trong hơn 10 năm hoạt động, chúng tôi đã hoàn thành hơn 100 dự án lớn nhỏ, từ các tòa nhà văn phòng, chung cư cao cấp, đến các công trình công cộng và nhà máy công nghiệp.</p>
        <p>Năm 2015, công ty mở rộng quy mô với việc thành lập các chi nhánh tại Hà Nội và Đà Nẵng, khẳng định vị thế là một trong những nhà thầu xây dựng hàng đầu tại Việt Nam.</p>
        <p>Đến năm 2020, chúng tôi đạt được chứng nhận ISO 9001:2015 về quản lý chất lượng và tiếp tục đầu tư vào công nghệ, nhân lực để nâng cao năng lực thi công.</p>`,
        section_type: AboutSectionType.history,
        sort_order: 1,
        status: BasicStatus.active,
      },
      {
        title: 'Sứ mệnh',
        content: `<p><strong>Sứ mệnh của chúng tôi</strong> là xây dựng những công trình bền vững, an toàn và thân thiện với môi trường, góp phần phát triển cơ sở hạ tầng và nâng cao chất lượng cuộc sống cho cộng đồng.</p>
        <p>Chúng tôi cam kết:</p>
        <ul>
          <li>Đảm bảo chất lượng công trình đạt tiêu chuẩn cao nhất</li>
          <li>Tuân thủ nghiêm ngặt các quy định về an toàn lao động</li>
          <li>Áp dụng công nghệ xây dựng hiện đại, thân thiện môi trường</li>
          <li>Phục vụ khách hàng với tinh thần trách nhiệm và chuyên nghiệp</li>
        </ul>`,
        section_type: AboutSectionType.mission,
        sort_order: 2,
        status: BasicStatus.active,
      },
      {
        title: 'Tầm nhìn',
        content: `<p><strong>Tầm nhìn đến năm 2030:</strong> Trở thành công ty xây dựng hàng đầu Đông Nam Á, được công nhận về chất lượng, đổi mới sáng tạo và trách nhiệm xã hội.</p>
        <p>Chúng tôi hướng tới:</p>
        <ul>
          <li>Mở rộng hoạt động ra các thị trường quốc tế</li>
          <li>Áp dụng công nghệ xây dựng 4.0 và BIM (Building Information Modeling)</li>
          <li>Phát triển bền vững với các dự án xanh, tiết kiệm năng lượng</li>
          <li>Xây dựng đội ngũ nhân sự chuyên nghiệp, có trình độ cao</li>
          <li>Đóng góp tích cực vào sự phát triển của ngành xây dựng Việt Nam</li>
        </ul>`,
        section_type: AboutSectionType.vision,
        sort_order: 3,
        status: BasicStatus.active,
      },
      {
        title: 'Giá trị cốt lõi',
        content: `<p>Chúng tôi xây dựng văn hóa doanh nghiệp dựa trên <strong>5 giá trị cốt lõi:</strong></p>
        <ol>
          <li><strong>Chất lượng:</strong> Đặt chất lượng lên hàng đầu trong mọi hoạt động</li>
          <li><strong>Chính trực:</strong> Làm việc minh bạch, trung thực và đáng tin cậy</li>
          <li><strong>Đổi mới:</strong> Không ngừng học hỏi và áp dụng công nghệ mới</li>
          <li><strong>Hợp tác:</strong> Làm việc nhóm hiệu quả, tôn trọng lẫn nhau</li>
          <li><strong>Trách nhiệm:</strong> Cam kết với khách hàng, nhân viên và cộng đồng</li>
        </ol>`,
        section_type: AboutSectionType.values,
        sort_order: 4,
        status: BasicStatus.active,
      },
      {
        title: 'Văn hóa doanh nghiệp',
        content: `<p>Chúng tôi xây dựng một môi trường làm việc năng động, sáng tạo và đầy cảm hứng, nơi mỗi nhân viên đều có cơ hội phát triển và đóng góp vào thành công chung của công ty.</p>
        <p><strong>Văn hóa của chúng tôi:</strong></p>
        <ul>
          <li>Khuyến khích tư duy đổi mới và sáng tạo</li>
          <li>Tạo điều kiện cho nhân viên học hỏi và phát triển kỹ năng</li>
          <li>Đánh giá cao sự đóng góp và thành tích của từng cá nhân</li>
          <li>Xây dựng tinh thần đồng đội và hỗ trợ lẫn nhau</li>
          <li>Cân bằng giữa công việc và cuộc sống cá nhân</li>
        </ul>`,
        section_type: AboutSectionType.culture,
        sort_order: 5,
        status: BasicStatus.active,
      },
      {
        title: 'Thành tựu nổi bật',
        content: `<p>Trong suốt quá trình hoạt động, chúng tôi đã đạt được nhiều thành tựu đáng tự hào:</p>
        <ul>
          <li><strong>2015:</strong> Nhận giải thưởng "Nhà thầu xây dựng xuất sắc" do Hiệp hội Xây dựng Việt Nam trao tặng</li>
          <li><strong>2018:</strong> Đạt chứng nhận ISO 9001:2015 về quản lý chất lượng</li>
          <li><strong>2020:</strong> Hoàn thành dự án lớn nhất trong lịch sử công ty - Khu đô thị sinh thái Green Valley</li>
          <li><strong>2022:</strong> Được vinh danh trong Top 10 công ty xây dựng uy tín nhất Việt Nam</li>
          <li><strong>2023:</strong> Đạt chứng nhận LEED Gold cho dự án xây dựng xanh</li>
        </ul>
        <p>Những thành tựu này là minh chứng cho sự nỗ lực không ngừng và cam kết của chúng tôi trong việc mang đến những công trình chất lượng cao.</p>`,
        section_type: AboutSectionType.achievement,
        sort_order: 6,
        status: BasicStatus.active,
      },
    ];

    for (const section of sections) {
      const slug = StringUtil.toSlug(section.title);
      await this.prisma.aboutSection.create({
        data: {
          ...section,
          slug,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
    }

    this.logger.log(`Seeded ${sections.length} about sections successfully`);
  }
}

