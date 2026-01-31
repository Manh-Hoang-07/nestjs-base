import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';

@Injectable()
export class PublicReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách reviews của comic
   */
  async getByComic(comicId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.comicReview.findMany({
        where: { comic_id: BigInt(comicId) },
        include: { user: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comicReview.count({ where: { comic_id: BigInt(comicId) } }),
    ]);

    return {
      data: toPlain(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
