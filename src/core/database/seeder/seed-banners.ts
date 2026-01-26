import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { BannerLinkTarget } from '@/shared/enums/types/banner-link-target.enum';

@Injectable()
export class SeedBanners {
    private readonly logger = new Logger(SeedBanners.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding banners...');

        const locationCodes = [
            'home', 'project', 'service', 'about', 'post',
            'contact', 'gallery', 'certificate', 'staff', 'faq'
        ];

        // Map code -> Sample Data
        const bannerDataMap: Record<string, any> = {
            home: { title: 'Kiến tạo không gian', subtitle: 'Giải pháp thiết kế & thi công trọn gói', button_text: 'Xem dự án' },
            project: { title: 'Dự án tiêu biểu', subtitle: 'Những công trình chúng tôi đã thực hiện' },
            service: { title: 'Dịch vụ chuyên nghiệp', subtitle: 'Cam kết chất lượng hàng đầu' },
            about: { title: 'Về chúng tôi', subtitle: 'Hành trình phát triển & Sứ mệnh' },
            post: { title: 'Tin tức & Sự kiện', subtitle: 'Cập nhật thông tin mới nhất' },
            contact: { title: 'Liên hệ', subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ bạn' },
            gallery: { title: 'Thư viện ảnh', subtitle: 'Góc nhìn chân thực về dự án' },
            certificate: { title: 'Chứng chỉ - Giải thưởng', subtitle: 'Khẳng định năng lực & Uy tín' },
            staff: { title: 'Đội ngũ nhân sự', subtitle: 'Chuyên nghiệp - Tận tâm - Sáng tạo' },
            faq: { title: 'Câu hỏi thường gặp', subtitle: 'Giải đáp thắc mắc của khách hàng' },
        };

        for (const code of locationCodes) {
            const location = await this.prisma.bannerLocation.findUnique({
                where: { code },
            });

            if (!location) {
                this.logger.warn(`Banner Location ${code} not found. Skipping.`);
                continue;
            }

            // Check if banner exists for this location (simple check)
            const existingBanner = await this.prisma.banner.findFirst({
                where: { location_id: location.id },
            });

            if (existingBanner) {
                // this.logger.log(`Banner for ${code} already exists. Skipping.`);
                continue;
            }

            const data = bannerDataMap[code] || { title: `Banner ${code}`, subtitle: '' };

            await this.prisma.banner.create({
                data: {
                    title: data.title,
                    subtitle: data.subtitle,
                    image: '/uploads/sample/banner-placeholder.jpg', // Placeholder
                    mobile_image: '/uploads/sample/banner-placeholder-mobile.jpg',
                    description: `Mô tả cho banner ${data.title}`,
                    link: '#',
                    link_target: BannerLinkTarget.SELF,
                    button_text: data.button_text || null,
                    button_color: data.button_text ? '#C6A96E' : null, // Gold/Primary color example
                    text_color: '#FFFFFF',
                    location_id: location.id,
                    sort_order: 1,
                    status: BasicStatus.active,
                },
            });

            this.logger.log(`Created banner for location: ${code}`);
        }

        this.logger.log(`Banners seeding completed.`);
    }
}
