import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedBannerLocations {
    private readonly logger = new Logger(SeedBannerLocations.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding banner locations...');

        const bannerLocations = [
            {
                code: 'home',
                name: 'Banner Trang chủ',
                description: 'Banner hiển thị tại trang chủ',
                status: BasicStatus.active,
            },
            {
                code: 'project',
                name: 'Banner Dự án',
                description: 'Banner hiển thị tại trang danh sách dự án',
                status: BasicStatus.active,
            },
            {
                code: 'service',
                name: 'Banner Dịch vụ',
                description: 'Banner hiển thị tại trang dịch vụ',
                status: BasicStatus.active,
            },
            {
                code: 'about',
                name: 'Banner Về chúng tôi',
                description: 'Banner hiển thị tại trang giới thiệu',
                status: BasicStatus.active,
            },
            {
                code: 'post',
                name: 'Banner Tin tức',
                description: 'Banner hiển thị tại trang tin tức/bài viết',
                status: BasicStatus.active,
            },
            {
                code: 'contact',
                name: 'Banner Liên hệ',
                description: 'Banner hiển thị tại trang liên hệ',
                status: BasicStatus.active,
            },
            {
                code: 'gallery',
                name: 'Banner Thư viện ảnh',
                description: 'Banner hiển thị tại trang thư viện ảnh',
                status: BasicStatus.active,
            },
            {
                code: 'certificate',
                name: 'Banner Chứng chỉ',
                description: 'Banner hiển thị tại trang chứng chỉ & giải thưởng',
                status: BasicStatus.active,
            },
            {
                code: 'staff',
                name: 'Banner Đội ngũ',
                description: 'Banner hiển thị tại trang đội ngũ nhân sự',
                status: BasicStatus.active,
            },
            {
                code: 'faq',
                name: 'Banner FAQ',
                description: 'Banner hiển thị tại trang câu hỏi thường gặp',
                status: BasicStatus.active,
            },
        ];

        for (const loc of bannerLocations) {
            await this.prisma.bannerLocation.upsert({
                where: { code: loc.code },
                update: {}, // Không update nếu đã tồn tại để tránh ghi đè sửa đổi của user
                create: loc,
            });
            this.logger.log(`Ensured banner location: ${loc.name} (${loc.code})`);
        }

        this.logger.log(`Banner locations seeding completed.`);
    }
}
