import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ProjectStatus } from '@/shared/enums/types/project-status.enum';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class SeedProjects {
  private readonly logger = new Logger(SeedProjects.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding projects...');

    const existingCount = await this.prisma.project.count();
    if (existingCount > 0) {
      this.logger.log(`Projects already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : null;

    const projects = [
      {
        name: 'Tòa nhà văn phòng cao cấp tại Quận 1',
        description: 'Dự án tòa nhà văn phòng 25 tầng với thiết kế hiện đại, tiện nghi đầy đủ. Tọa lạc tại vị trí đắc địa trung tâm thành phố, gần các trung tâm thương mại và giao thông công cộng.',
        short_description: 'Tòa nhà văn phòng 25 tầng hiện đại tại trung tâm TP.HCM',
        location: 'Quận 1, TP.HCM',
        area: 15000.00,
        start_date: new Date('2022-01-15'),
        end_date: new Date('2024-06-30'),
        status: ProjectStatus.completed,
        client_name: 'Công ty TNHH ABC',
        budget: 500000000000,
        images: JSON.stringify([
          '/uploads/projects/office-building-1.jpg',
          '/uploads/projects/office-building-2.jpg',
          '/uploads/projects/office-building-3.jpg',
        ]),
        featured: true,
        sort_order: 1,
        meta_title: 'Tòa nhà văn phòng cao cấp Quận 1 - Dự án hoàn thành',
        meta_description: 'Dự án tòa nhà văn phòng 25 tầng hiện đại tại Quận 1, TP.HCM. Thiết kế sang trọng, tiện nghi đầy đủ.',
      },
      {
        name: 'Khu đô thị sinh thái Green Valley',
        description: 'Khu đô thị sinh thái quy mô lớn với hơn 500 căn hộ, kết hợp không gian xanh và tiện ích hiện đại. Dự án bao gồm trường học, bệnh viện, trung tâm thương mại và công viên.',
        short_description: 'Khu đô thị sinh thái 500 căn hộ với đầy đủ tiện ích',
        location: 'Quận 7, TP.HCM',
        area: 250000.00,
        start_date: new Date('2023-03-01'),
        end_date: new Date('2025-12-31'),
        status: ProjectStatus.in_progress,
        client_name: 'Tập đoàn XYZ',
        budget: 2000000000000,
        images: JSON.stringify([
          '/uploads/projects/green-valley-1.jpg',
          '/uploads/projects/green-valley-2.jpg',
        ]),
        featured: true,
        sort_order: 2,
        meta_title: 'Khu đô thị sinh thái Green Valley - Dự án đang thi công',
        meta_description: 'Khu đô thị sinh thái quy mô lớn tại Quận 7 với hơn 500 căn hộ và đầy đủ tiện ích.',
      },
      {
        name: 'Trung tâm thương mại Mega Mall',
        description: 'Trung tâm thương mại 5 tầng với diện tích 30,000m², bao gồm các cửa hàng thời trang, nhà hàng, rạp chiếu phim và khu vui chơi giải trí.',
        short_description: 'Trung tâm thương mại 5 tầng hiện đại',
        location: 'Quận 2, TP.HCM',
        area: 30000.00,
        start_date: new Date('2021-06-01'),
        end_date: new Date('2023-09-30'),
        status: ProjectStatus.completed,
        client_name: 'Công ty Cổ phần DEF',
        budget: 800000000000,
        images: JSON.stringify([
          '/uploads/projects/mega-mall-1.jpg',
          '/uploads/projects/mega-mall-2.jpg',
          '/uploads/projects/mega-mall-3.jpg',
          '/uploads/projects/mega-mall-4.jpg',
        ]),
        featured: false,
        sort_order: 3,
        meta_title: 'Trung tâm thương mại Mega Mall - Dự án hoàn thành',
        meta_description: 'Trung tâm thương mại 5 tầng với đầy đủ tiện ích tại Quận 2, TP.HCM.',
      },
      {
        name: 'Bệnh viện đa khoa quốc tế',
        description: 'Bệnh viện đa khoa quốc tế với 500 giường bệnh, trang thiết bị y tế hiện đại. Dự án bao gồm các khoa chuyên môn, phòng mổ, phòng cấp cứu và khu vực điều trị ngoại trú.',
        short_description: 'Bệnh viện đa khoa quốc tế 500 giường bệnh',
        location: 'Quận Bình Thạnh, TP.HCM',
        area: 45000.00,
        start_date: new Date('2024-01-10'),
        end_date: new Date('2026-08-31'),
        status: ProjectStatus.in_progress,
        client_name: 'Tập đoàn Y tế GHI',
        budget: 1500000000000,
        images: JSON.stringify([
          '/uploads/projects/hospital-1.jpg',
          '/uploads/projects/hospital-2.jpg',
        ]),
        featured: true,
        sort_order: 4,
        meta_title: 'Bệnh viện đa khoa quốc tế - Dự án đang thi công',
        meta_description: 'Bệnh viện đa khoa quốc tế với 500 giường bệnh và trang thiết bị hiện đại.',
      },
      {
        name: 'Chung cư cao cấp Sky Tower',
        description: 'Tòa chung cư cao cấp 30 tầng với 200 căn hộ, thiết kế sang trọng, view đẹp. Mỗi căn hộ đều có ban công riêng, hệ thống điều hòa trung tâm và bảo vệ 24/7.',
        short_description: 'Chung cư cao cấp 30 tầng với 200 căn hộ',
        location: 'Quận 3, TP.HCM',
        area: 12000.00,
        start_date: new Date('2020-09-01'),
        end_date: new Date('2023-03-31'),
        status: ProjectStatus.completed,
        client_name: 'Công ty TNHH JKL',
        budget: 600000000000,
        images: JSON.stringify([
          '/uploads/projects/sky-tower-1.jpg',
          '/uploads/projects/sky-tower-2.jpg',
          '/uploads/projects/sky-tower-3.jpg',
        ]),
        featured: false,
        sort_order: 5,
        meta_title: 'Chung cư cao cấp Sky Tower - Dự án hoàn thành',
        meta_description: 'Tòa chung cư cao cấp 30 tầng với 200 căn hộ tại Quận 3, TP.HCM.',
      },
      {
        name: 'Nhà máy sản xuất công nghệ cao',
        description: 'Nhà máy sản xuất với diện tích 50,000m², áp dụng công nghệ 4.0, tự động hóa cao. Dự án bao gồm khu sản xuất, kho bãi, văn phòng và khu vực nghiên cứu phát triển.',
        short_description: 'Nhà máy sản xuất công nghệ cao 50,000m²',
        location: 'Khu công nghiệp Long Bình, Đồng Nai',
        area: 50000.00,
        start_date: new Date('2023-08-15'),
        end_date: new Date('2025-05-31'),
        status: ProjectStatus.in_progress,
        client_name: 'Công ty Cổ phần MNO',
        budget: 1200000000000,
        images: JSON.stringify([
          '/uploads/projects/factory-1.jpg',
          '/uploads/projects/factory-2.jpg',
        ]),
        featured: false,
        sort_order: 6,
        meta_title: 'Nhà máy sản xuất công nghệ cao - Dự án đang thi công',
        meta_description: 'Nhà máy sản xuất với công nghệ 4.0 tại Khu công nghiệp Long Bình, Đồng Nai.',
      },
    ];

    for (const project of projects) {
      const slug = StringUtil.toSlug(project.name);
      await this.prisma.project.create({
        data: {
          ...project,
          slug,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
    }

    // ========== SEED ADDITIONAL RANDOM PROJECTS ==========
    this.logger.log('Seeding additional random projects...');
    const randomProjectCount = 40;

    const locations = ['Quận 1, TP.HCM', 'Quận 2, TP.HCM', 'Quận 7, TP.HCM', 'Bình Dương', 'Đồng Nai', 'Long An', 'Hà Nội', 'Đà Nẵng'];
    const statuses = [ProjectStatus.completed, ProjectStatus.in_progress, ProjectStatus.planning];

    for (let i = 1; i <= randomProjectCount; i++) {
      const name = `Dự án mẫu số ${i}: Tòa nhà cao cấp Horizon ${i}`;
      const slug = StringUtil.toSlug(name);

      await this.prisma.project.create({
        data: {
          name: name,
          slug: `${slug}-${i}`,
          description: `Mô tả chi tiết dự án mẫu số ${i}. Dự án này bao gồm các tiện ích hiện đại và không gian xanh. Tọa lạc tại vị trí đắc địa, thuận lợi cho giao thông và kinh doanh.`,
          short_description: `Dự án mẫu ${i} với thiết kế hiện đại và tiện ích vượt trội.`,
          location: locations[i % locations.length],
          area: 1000 + (i * 500),
          start_date: new Date(2020 + (i % 5), (i % 12), 1),
          end_date: new Date(2022 + (i % 5), (i % 12), 1),
          status: statuses[i % statuses.length],
          client_name: `Khách hàng Doanh nghiệp ${i}`,
          budget: 1000000000 * (i + 1),
          images: JSON.stringify([
            `/uploads/projects/demo-${(i % 5) + 1}.jpg`,
            `/uploads/projects/demo-${((i + 1) % 5) + 1}.jpg`,
          ]),
          featured: i % 5 === 0,
          sort_order: 10 + i,
          meta_title: `Dự án mẫu ${i} - ${locations[i % locations.length]}`,
          meta_description: `Thông tin dự án mẫu ${i} tại ${locations[i % locations.length]}.`,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        }
      });

      this.logger.log(`Created random project ${i}: ${name}`);
    }

    this.logger.log(`Seeded ${projects.length} projects successfully`);
  }
}

