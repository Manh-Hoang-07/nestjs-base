import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getByComic(comicId: number) {
    return this.prisma.comicReview.findMany({
      where: { comic_id: comicId },
      include: { user: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async getByUser(userId: number) {
    return this.prisma.comicReview.findMany({
      where: { user_id: userId },
      include: { comic: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async createOrUpdate(comicId: number, rating: number, content?: string) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating phải từ 1 đến 5');
    }

    const existing = await this.prisma.comicReview.findFirst({
      where: { user_id: userId, comic_id: comicId },
    });

    let review;
    let oldRating: number | null = null;

    if (existing) {
      oldRating = existing.rating;
      review = await this.prisma.comicReview.update({
        where: { id: existing.id },
        data: {
          rating,
          content,
        },
      });
    } else {
      review = await this.prisma.comicReview.create({
        data: {
          user_id: userId,
          comic_id: comicId,
          rating,
          content,
        },
      });
    }

    // Update comic stats
    await this.updateComicStats(comicId, rating, oldRating, !existing);

    return review;
  }

  async delete(comicId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const review = await this.prisma.comicReview.findFirst({
      where: { user_id: userId, comic_id: comicId },
    });

    if (!review) {
      throw new BadRequestException('Review không tồn tại');
    }

    await this.prisma.comicReview.delete({
      where: { id: review.id },
    });

    // Update comic stats
    const stats = await this.prisma.comicStats.findUnique({ where: { comic_id: comicId } });
    if (stats) {
      await this.prisma.comicStats.update({
        where: { comic_id: comicId },
        data: {
          rating_count: BigInt(Math.max(0, Number(stats.rating_count) - 1)),
          rating_sum: BigInt(Math.max(0, Number(stats.rating_sum) - review.rating)),
        },
      });
    }

    return { deleted: true };
  }

  private async updateComicStats(comicId: number, newRating: number, oldRating: number | null, isNew: boolean) {
    let stats = await this.prisma.comicStats.findUnique({ where: { comic_id: comicId } });
    
    if (!stats) {
      stats = await this.prisma.comicStats.create({
        data: {
          comic_id: comicId,
          view_count: 0,
          follow_count: 0,
          rating_count: 0,
          rating_sum: 0,
        },
      });
    }

    if (isNew) {
      await this.prisma.comicStats.update({
        where: { comic_id: comicId },
        data: {
          rating_count: BigInt(Number(stats.rating_count) + 1),
          rating_sum: BigInt(Number(stats.rating_sum) + newRating),
        },
      });
    } else if (oldRating !== null) {
      await this.prisma.comicStats.update({
        where: { comic_id: comicId },
        data: {
          rating_sum: BigInt(Number(stats.rating_sum) - oldRating + newRating),
        },
      });
    }
  }
}



