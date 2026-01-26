import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class SeedGallery {
  private readonly logger = new Logger(SeedGallery.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding gallery...');

    const existingCount = await this.prisma.gallery.count();
    if (existingCount > 0) {
      this.logger.log(`Gallery already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : null;

    const galleries = [
      {
        title: 'Dự án Tòa nhà Văn phòng Quận 1',
        description: 'Bộ sưu tập ảnh về quá trình thi công và hoàn thiện tòa nhà văn phòng cao cấp tại Quận 1',
        cover_image: '/uploads/gallery/office-building-cover.jpg',
        images: JSON.stringify([
          '/uploads/gallery/office-building-1.jpg',
          '/uploads/gallery/office-building-2.jpg',
          '/uploads/gallery/office-building-3.jpg',
          '/uploads/gallery/office-building-4.jpg',
          '/uploads/gallery/office-building-5.jpg',
        ]),
        featured: true,
        status: BasicStatus.active,
        sort_order: 1,
      },
      {
        title: 'Khu đô thị sinh thái Green Valley',
        description: 'Hình ảnh về khu đô thị sinh thái với không gian xanh và tiện ích hiện đại',
        cover_image: '/uploads/gallery/green-valley-cover.jpg',
        images: JSON.stringify([
          '/uploads/gallery/green-valley-1.jpg',
          '/uploads/gallery/green-valley-2.jpg',
          '/uploads/gallery/green-valley-3.jpg',
          '/uploads/gallery/green-valley-4.jpg',
        ]),
        featured: true,
        status: BasicStatus.active,
        sort_order: 2,
      },
      {
        title: 'Trung tâm Thương mại Mega Mall',
        description: 'Ảnh về trung tâm thương mại 5 tầng với các cửa hàng và khu vui chơi giải trí',
        cover_image: '/uploads/gallery/mega-mall-cover.jpg',
        images: JSON.stringify([
          '/uploads/gallery/mega-mall-1.jpg',
          '/uploads/gallery/mega-mall-2.jpg',
          '/uploads/gallery/mega-mall-3.jpg',
        ]),
        featured: false,
        status: BasicStatus.active,
        sort_order: 3,
      },
      {
        title: 'Bệnh viện Đa khoa Quốc tế',
        description: 'Hình ảnh về bệnh viện đa khoa quốc tế với trang thiết bị y tế hiện đại',
        cover_image: '/uploads/gallery/hospital-cover.jpg',
        images: JSON.stringify([
          '/uploads/gallery/hospital-1.jpg',
          '/uploads/gallery/hospital-2.jpg',
          '/uploads/gallery/hospital-3.jpg',
          '/uploads/gallery/hospital-4.jpg',
        ]),
        featured: true,
        status: BasicStatus.active,
        sort_order: 4,
      },
      {
        title: 'Chung cư cao cấp Sky Tower',
        description: 'Bộ sưu tập ảnh về tòa chung cư cao cấp 30 tầng với thiết kế sang trọng',
        cover_image: '/uploads/gallery/sky-tower-cover.jpg',
        images: JSON.stringify([
          '/uploads/gallery/sky-tower-1.jpg',
          '/uploads/gallery/sky-tower-2.jpg',
          '/uploads/gallery/sky-tower-3.jpg',
        ]),
        featured: false,
        status: BasicStatus.active,
        sort_order: 5,
      },
    ];

    for (const gallery of galleries) {
      const slug = StringUtil.toSlug(gallery.title);
      await this.prisma.gallery.create({
        data: {
          ...gallery,
          slug,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
    }

    // ========== SEED ADDITIONAL RANDOM GALLERIES ==========
    this.logger.log('Seeding additional random galleries...');
    const randomGalleryCount = 40;

    for (let i = 1; i <= randomGalleryCount; i++) {
      const title = `Bộ sưu tập ảnh mẫu ${i}: Sự kiện công ty ${i}`;
      const slug = StringUtil.toSlug(title);

      await this.prisma.gallery.create({
        data: {
          title: title,
          slug: `${slug}-${i}`,
          description: `Mô tả chi tiết về bộ sưu tập ảnh số ${i}. Bao gồm các hình ảnh hoạt động và sự kiện nổi bật.`,
          cover_image: `/uploads/gallery/demo-cover-${(i % 5) + 1}.jpg`,
          images: JSON.stringify([
            `/uploads/gallery/demo-${(i % 5) + 1}.jpg`,
            `/uploads/gallery/demo-${((i + 1) % 5) + 1}.jpg`,
            `/uploads/gallery/demo-${((i + 2) % 5) + 1}.jpg`,
          ]),
          featured: i % 5 === 0,
          status: BasicStatus.active,
          sort_order: 10 + i,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        }
      });

      this.logger.log(`Created random gallery ${i}: ${title}`);
    }

    this.logger.log(`Seeded ${galleries.length} gallery items successfully`);
  }
}

