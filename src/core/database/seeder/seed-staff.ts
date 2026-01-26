import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedStaff {
  private readonly logger = new Logger(SeedStaff.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding staff...');

    const existingCount = await this.prisma.staff.count();
    if (existingCount > 0) {
      this.logger.log(`Staff already exist (${existingCount} records). Skipping seeding.`);
      return;
    }

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : null;

    const staffMembers = [
      {
        name: 'Nguyễn Văn An',
        position: 'Tổng Giám đốc',
        department: 'Ban Giám đốc',
        bio: 'Hơn 20 năm kinh nghiệm trong ngành xây dựng, từng đảm nhiệm nhiều vị trí quan trọng tại các công ty xây dựng hàng đầu. Tốt nghiệp Thạc sĩ Kỹ thuật Xây dựng tại Đại học Bách Khoa TP.HCM.',
        avatar: '/uploads/staff/nguyen-van-an.jpg',
        email: 'nguyenvanan@company.com',
        phone: '0901234567',
        social_links: JSON.stringify({
          linkedin: 'https://linkedin.com/in/nguyenvanan',
          facebook: 'https://facebook.com/nguyenvanan',
        }),
        experience: 20,
        expertise: 'Quản lý dự án, Kỹ thuật xây dựng, Quản trị doanh nghiệp',
        status: BasicStatus.active,
        sort_order: 1,
      },
      {
        name: 'Trần Thị Bình',
        position: 'Phó Tổng Giám đốc',
        department: 'Ban Giám đốc',
        bio: 'Chuyên gia về quản lý chất lượng và an toàn lao động. Có chứng chỉ PMP và ISO 9001 Lead Auditor. Đã tham gia quản lý hơn 50 dự án xây dựng lớn.',
        avatar: '/uploads/staff/tran-thi-binh.jpg',
        email: 'tranthibinh@company.com',
        phone: '0901234568',
        social_links: JSON.stringify({
          linkedin: 'https://linkedin.com/in/tranthibinh',
        }),
        experience: 18,
        expertise: 'Quản lý chất lượng, An toàn lao động, Quản lý dự án',
        status: BasicStatus.active,
        sort_order: 2,
      },
      {
        name: 'Lê Văn Cường',
        position: 'Giám đốc Kỹ thuật',
        department: 'Phòng Kỹ thuật',
        bio: 'Kỹ sư xây dựng với 15 năm kinh nghiệm thiết kế và thi công các công trình lớn. Chuyên về kết cấu bê tông cốt thép và công nghệ xây dựng hiện đại.',
        avatar: '/uploads/staff/le-van-cuong.jpg',
        email: 'levancuong@company.com',
        phone: '0901234569',
        social_links: JSON.stringify({}),
        experience: 15,
        expertise: 'Kết cấu xây dựng, Thiết kế công trình, Công nghệ BIM',
        status: BasicStatus.active,
        sort_order: 3,
      },
      {
        name: 'Phạm Thị Dung',
        position: 'Trưởng phòng Thiết kế',
        department: 'Phòng Thiết kế',
        bio: 'Kiến trúc sư với 12 năm kinh nghiệm thiết kế các công trình dân dụng và công nghiệp. Tốt nghiệp Đại học Kiến trúc TP.HCM, có nhiều giải thưởng thiết kế.',
        avatar: '/uploads/staff/pham-thi-dung.jpg',
        email: 'phamthidung@company.com',
        phone: '0901234570',
        social_links: JSON.stringify({
          linkedin: 'https://linkedin.com/in/phamthidung',
          behance: 'https://behance.net/phamthidung',
        }),
        experience: 12,
        expertise: 'Thiết kế kiến trúc, Thiết kế nội thất, 3D Visualization',
        status: BasicStatus.active,
        sort_order: 4,
      },
      {
        name: 'Hoàng Văn Đức',
        position: 'Trưởng phòng Thi công',
        department: 'Phòng Thi công',
        bio: 'Kỹ sư thi công với 14 năm kinh nghiệm quản lý các công trường lớn. Chuyên về thi công nhà cao tầng và công trình công nghiệp. Có chứng chỉ quản lý dự án PMP.',
        avatar: '/uploads/staff/hoang-van-duc.jpg',
        email: 'hoangvanduc@company.com',
        phone: '0901234571',
        social_links: JSON.stringify({}),
        experience: 14,
        expertise: 'Quản lý thi công, An toàn lao động, Quản lý tiến độ',
        status: BasicStatus.active,
        sort_order: 5,
      },
      {
        name: 'Võ Thị Em',
        position: 'Trưởng phòng Kinh doanh',
        department: 'Phòng Kinh doanh',
        bio: 'Chuyên viên kinh doanh với 10 năm kinh nghiệm trong lĩnh vực xây dựng. Đã tham gia đàm phán và ký kết nhiều hợp đồng lớn với các đối tác trong và ngoài nước.',
        avatar: '/uploads/staff/vo-thi-em.jpg',
        email: 'vothiem@company.com',
        phone: '0901234572',
        social_links: JSON.stringify({
          linkedin: 'https://linkedin.com/in/vothiem',
        }),
        experience: 10,
        expertise: 'Kinh doanh B2B, Đàm phán hợp đồng, Quan hệ đối tác',
        status: BasicStatus.active,
        sort_order: 6,
      },
    ];

    for (const staff of staffMembers) {
      await this.prisma.staff.create({
        data: {
          ...staff,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        },
      });
    }

    // ========== SEED ADDITIONAL RANDOM STAFF ==========
    this.logger.log('Seeding additional random staff...');
    const randomStaffCount = 40;
    const departments = ['Phòng Kỹ thuật', 'Phòng Thiết kế', 'Phòng Thi công', 'Phòng Kinh doanh', 'Phòng Hành chính', 'Phòng Kế toán'];
    const positions = ['Nhân viên', 'Chuyên viên', 'Trưởng nhóm', 'Phó phòng'];
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Phan', 'Trương'];
    const middleNames = ['Văn', 'Thị', 'Đức', 'Thành', 'Minh', 'Hữu'];
    const firstNames = ['An', 'Bình', 'Cường', 'Dung', 'Đức', 'Em', 'Giang', 'Hương', 'Hùng', 'Khanh', 'Lan', 'Minh'];

    for (let i = 1; i <= randomStaffCount; i++) {
      // Generate random name
      const lastName = lastNames[i % lastNames.length];
      const middleName = middleNames[i % middleNames.length];
      const firstName = firstNames[i % firstNames.length];
      const fullName = `${lastName} ${middleName} ${firstName} ${i}`;

      await this.prisma.staff.create({
        data: {
          name: fullName,
          position: positions[i % positions.length],
          department: departments[i % departments.length],
          bio: `Nhân viên ${fullName} có nhiều năm kinh nghiệm trong lĩnh vực ${departments[i % departments.length]}. Đã tham gia nhiều dự án quan trọng của công ty.`,
          avatar: `/uploads/staff/demo-${(i % 5) + 1}.jpg`,
          email: `staff${i}@company.com`,
          phone: `09${i.toString().padStart(8, '0')}`,
          social_links: JSON.stringify({
            linkedin: `https://linkedin.com/in/staff${i}`,
            facebook: i % 2 === 0 ? `https://facebook.com/staff${i}` : undefined,
          }),
          experience: (i % 15) + 1,
          expertise: `Kỹ năng ${i}, Kỹ năng ${(i + 1) % 10}`,
          status: BasicStatus.active,
          sort_order: 10 + i,
          created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
          updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        }
      });

      this.logger.log(`Created random staff ${i}: ${fullName}`);
    }

    this.logger.log(`Seeded ${staffMembers.length} staff members successfully`);
  }
}

