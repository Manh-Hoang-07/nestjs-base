import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get list với filter và search
   */
  async getList(filters: any = {}, options: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const sort = options.sort || 'created_at:DESC';
    const [sortField, sortOrder] = sort.split(':');

    // Build where clause
    const where: Prisma.ComicReviewWhereInput = {
      deleted_at: null,
    };

    if (filters.comic_id) {
      where.comic_id = filters.comic_id;
    }

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters.rating) {
      where.rating = filters.rating;
    }

    if (filters.rating_min || filters.rating_max) {
      where.rating = {};
      if (filters.rating_min) {
        where.rating.gte = filters.rating_min;
      }
      if (filters.rating_max) {
        where.rating.lte = filters.rating_max;
      }
    }

    if (filters.search) {
      where.content = { contains: filters.search };
    }

    if (filters.date_from || filters.date_to) {
      where.created_at = {};
      if (filters.date_from) {
        where.created_at.gte = new Date(filters.date_from);
      }
      if (filters.date_to) {
        where.created_at.lte = new Date(filters.date_to);
      }
    }

    // Build orderBy
    const prismaSortOrder = sortOrder.toLowerCase() === 'asc' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;
    let orderBy: Prisma.ComicReviewOrderByWithRelationInput;
    
    if (sortField && ['id', 'created_at', 'updated_at', 'rating', 'user_id', 'comic_id'].includes(sortField)) {
      switch (sortField) {
        case 'id':
          orderBy = { id: prismaSortOrder };
          break;
        case 'created_at':
          orderBy = { created_at: prismaSortOrder };
          break;
        case 'updated_at':
          orderBy = { updated_at: prismaSortOrder };
          break;
        case 'rating':
          orderBy = { rating: prismaSortOrder };
          break;
        case 'user_id':
          orderBy = { user_id: prismaSortOrder };
          break;
        case 'comic_id':
          orderBy = { comic_id: prismaSortOrder };
          break;
        default:
          orderBy = { created_at: Prisma.SortOrder.desc };
      }
    } else {
      orderBy = { created_at: Prisma.SortOrder.desc };
    }

    const [data, total] = await Promise.all([
      this.prisma.comicReview.findMany({
        where,
        include: {
          user: true,
          comic: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.comicReview.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get one với relations
   */
  async getOne(where: any): Promise<any | null> {
    return this.prisma.comicReview.findFirst({
      where: { ...where, deleted_at: null },
      include: {
        user: true,
        comic: true,
      },
    });
  }

  /**
   * Update review
   */
  async update(id: number, data: { content?: string; rating?: number }) {
    const review = await this.getOne({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updateData: Prisma.ComicReviewUpdateInput = {};
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      updateData.rating = data.rating;
    }

    return this.prisma.comicReview.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        comic: true,
      },
    });
  }

  /**
   * Delete review (soft delete)
   */
  async delete(id: number) {
    const review = await this.getOne({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.comicReview.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return { deleted: true };
  }

  /**
   * Restore review
   */
  async restore(id: number) {
    const review = await this.prisma.comicReview.findFirst({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.comicReview.update({
      where: { id },
      data: { deleted_at: null },
    });

    return this.getOne({ id });
  }

  /**
   * Get review statistics
   */
  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, todayCount, thisWeekCount, thisMonthCount, avgRatingResult, ratingDistribution] = await Promise.all([
      this.prisma.comicReview.count({ where: { deleted_at: null } }),
      this.prisma.comicReview.count({
        where: {
          created_at: { gte: today },
          deleted_at: null,
        },
      }),
      this.prisma.comicReview.count({
        where: {
          created_at: { gte: startOfWeek },
          deleted_at: null,
        },
      }),
      this.prisma.comicReview.count({
        where: {
          created_at: { gte: startOfMonth },
          deleted_at: null,
        },
      }),
      this.prisma.comicReview.aggregate({
        where: { deleted_at: null },
        _avg: { rating: true },
      }),
      this.prisma.comicReview.groupBy({
        by: ['rating'],
        where: { deleted_at: null },
        _count: { rating: true },
        orderBy: { rating: Prisma.SortOrder.asc },
      }),
    ]);

    return {
      total,
      today: todayCount,
      this_week: thisWeekCount,
      this_month: thisMonthCount,
      average_rating: avgRatingResult._avg.rating || 0,
      rating_distribution: ratingDistribution.map(r => ({
        rating: r.rating,
        count: r._count.rating,
      })),
    };
  }
}

