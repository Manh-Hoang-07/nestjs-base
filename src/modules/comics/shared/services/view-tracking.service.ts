import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class ViewTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track view cho comic/chapter
   * Prevent duplicate views trong 1 giờ (IP + user_id)
   */
  async trackView(data: {
    comic_id: number;
    chapter_id?: number;
    user_id?: number;
    ip?: string;
    user_agent?: string;
  }) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Kiểm tra duplicate view
    const existingView = await this.prisma.comicView.findFirst({
      where: {
        comic_id: BigInt(data.comic_id),
        chapter_id: data.chapter_id ? BigInt(data.chapter_id) : null,
        user_id: data.user_id ? BigInt(data.user_id) : null,
        ip: data.ip || null,
        created_at: { gte: oneHourAgo },
      },
    });

    if (existingView) {
      return { tracked: false, reason: 'duplicate' };
    }

    // Tạo view record
    await this.prisma.comicView.create({
      data: {
        comic_id: BigInt(data.comic_id),
        chapter_id: data.chapter_id ? BigInt(data.chapter_id) : null,
        user_id: data.user_id ? BigInt(data.user_id) : null,
        ip: data.ip || null,
        user_agent: data.user_agent || null,
      },
    });

    // Update stats (async, có thể dùng queue)
    await this.updateStats(data.comic_id, data.chapter_id);

    return { tracked: true };
  }

  /**
   * Aggregate views vào comic_stats
   */
  private async updateStats(comicId: number, chapterId?: number) {
    // Update comic view count
    const viewCount = await this.prisma.comicView.count({
      where: { comic_id: BigInt(comicId) },
    });

    await this.prisma.comicStats.upsert({
      where: { comic_id: BigInt(comicId) },
      create: { comic_id: BigInt(comicId), view_count: BigInt(viewCount) },
      update: { view_count: BigInt(viewCount) },
    });

    // Update chapter view count nếu có
    if (chapterId) {
      const chapterViewCount = await this.prisma.comicView.count({
        where: { chapter_id: BigInt(chapterId) },
      });

      await this.prisma.chapter.update({
        where: { id: BigInt(chapterId) },
        data: { view_count: BigInt(chapterViewCount) },
      });
    }
  }
}



