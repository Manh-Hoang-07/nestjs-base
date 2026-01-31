import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedComicCategories {
  private readonly logger = new Logger(SeedComicCategories.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding comic categories...');

    // Check if categories already exist
    const existingCategories = await this.prisma.comicCategory.count();
    if (existingCategories > 0) {
      this.logger.log('Comic categories already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    // Seed comic categories - các thể loại truyện tranh phổ biến
    const categoriesData = [
      { name: 'Action', slug: 'action', description: 'Thể loại hành động' },
      { name: 'Adventure', slug: 'adventure', description: 'Thể loại phiêu lưu' },
      { name: 'Comedy', slug: 'comedy', description: 'Thể loại hài hước' },
      { name: 'Drama', slug: 'drama', description: 'Thể loại chính kịch' },
      { name: 'Fantasy', slug: 'fantasy', description: 'Thể loại giả tưởng' },
      { name: 'Horror', slug: 'horror', description: 'Thể loại kinh dị' },
      { name: 'Mystery', slug: 'mystery', description: 'Thể loại bí ẩn' },
      { name: 'Romance', slug: 'romance', description: 'Thể loại lãng mạn' },
      { name: 'Sci-Fi', slug: 'sci-fi', description: 'Thể loại khoa học viễn tưởng' },
      { name: 'Slice of Life', slug: 'slice-of-life', description: 'Thể loại đời thường' },
      { name: 'Sports', slug: 'sports', description: 'Thể loại thể thao' },
      { name: 'Supernatural', slug: 'supernatural', description: 'Thể loại siêu nhiên' },
      { name: 'Thriller', slug: 'thriller', description: 'Thể loại ly kỳ' },
      { name: 'Yaoi', slug: 'yaoi', description: 'Thể loại yaoi' },
      { name: 'Yuri', slug: 'yuri', description: 'Thể loại yuri' },
      { name: 'Ecchi', slug: 'ecchi', description: 'Thể loại ecchi' },
      { name: 'Harem', slug: 'harem', description: 'Thể loại harem' },
      { name: 'Isekai', slug: 'isekai', description: 'Thể loại isekai' },
      { name: 'Mecha', slug: 'mecha', description: 'Thể loại mecha' },
      { name: 'School', slug: 'school', description: 'Thể loại học đường' },
      { name: 'Shounen', slug: 'shounen', description: 'Thể loại shounen' },
      { name: 'Shoujo', slug: 'shoujo', description: 'Thể loại shoujo' },
      { name: 'Seinen', slug: 'seinen', description: 'Thể loại seinen' },
      { name: 'Josei', slug: 'josei', description: 'Thể loại josei' },
      { name: 'Webtoon', slug: 'webtoon', description: 'Thể loại webtoon' },
    ];

    for (const categoryData of categoriesData) {
      await this.prisma.comicCategory.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        },
      });
      this.logger.log(`Created category: ${categoryData.name}`);
    }

    this.logger.log(`Comic categories seeding completed - Total: ${categoriesData.length}`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing comic categories...');
    await this.prisma.comicCategory.deleteMany({});
    this.logger.log('Comic categories cleared');
  }
}



