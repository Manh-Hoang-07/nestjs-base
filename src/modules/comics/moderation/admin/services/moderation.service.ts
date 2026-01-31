import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Ẩn comment
   */
  async hideComment(commentId: number) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deleted_at: null },
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
      where: { id: commentId, deleted_at: null },
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
      where: { id: reviewId, deleted_at: null },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Soft delete review
    await this.prisma.comicReview.update({
      where: { id: reviewId },
      data: { deleted_at: new Date() },
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
          deleted_at: null,
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
          deleted_at: null,
        },
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}



