import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { createPaginationMeta } from '@/common/core/utils';
import { toPlain } from '@/common/shared/utils';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Ẩn comment
   */
  async hideComment(commentId: number) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { status: 'hidden' },
    });
  }

  /**
   * Hiện comment
   */
  async showComment(commentId: number) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { status: 'visible' },
    });
  }

  /**
   * Ẩn review
   */
  async hideReview(reviewId: number) {
    const review = await this.prisma.comicReview.findFirst({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Hard delete review
    await this.prisma.comicReview.delete({
      where: { id: reviewId },
    });

    return { hidden: true };
  }

  /**
   * Lấy danh sách comments chờ duyệt
   */
  async getPendingComments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Có thể thêm logic để filter comments cần moderation
    // Ví dụ: comments có từ khóa spam, hoặc được report
    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          status: 'visible',
        },
        include: {
          user: true,
          comic: true,
          chapter: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: {
          status: 'visible',
        },
      }),
    ]);

    return {
      data: toPlain(data),
      meta: createPaginationMeta(page, limit, total),
    };
  }
}



