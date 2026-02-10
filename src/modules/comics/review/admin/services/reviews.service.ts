import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ComicReview, Prisma } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IPaginationOptions } from '@/common/core/repositories';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../domain/review.repository';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';

@Injectable()
export class ReviewsService extends BaseService<ComicReview, IReviewRepository> {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    protected readonly reviewRepository: IReviewRepository,
  ) {
    super(reviewRepository);
  }

  protected override async prepareFilters(filters: Record<string, any> = {}): Promise<Record<string, any>> {
    const prepared = { ...filters };

    if (prepared.rating) {
      prepared.rating = Number(prepared.rating);
    }

    if (prepared.rating_min || prepared.rating_max) {
      prepared.rating = {};
      if (prepared.rating_min) {
        prepared.rating.gte = Number(prepared.rating_min);
        delete prepared.rating_min;
      }
      if (prepared.rating_max) {
        prepared.rating.lte = Number(prepared.rating_max);
        delete prepared.rating_max;
      }
    }

    if (prepared.search) {
      prepared.content = { contains: prepared.search };
      delete prepared.search;
    }

    if (prepared.date_from || prepared.date_to) {
      prepared.created_at = {};
      if (prepared.date_from) {
        prepared.created_at.gte = new Date(prepared.date_from);
        delete prepared.date_from;
      }
      if (prepared.date_to) {
        prepared.created_at.lte = new Date(prepared.date_to);
        delete prepared.date_to;
      }
    }

    // Gán group_id từ RequestContext
    if (prepared.group_id === undefined) {
      Object.assign(prepared, this.getGroupFilter());
    }

    return prepared;
  }

  protected override async prepareOptions(options: IPaginationOptions): Promise<IPaginationOptions> {
    const normalized = await super.prepareOptions(options);
    (normalized as any).include = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      comic: true,
    };
    return normalized;
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

    const [total, todayCount, thisWeekCount, thisMonthCount, avgRating, ratingDistribution] = await Promise.all([
      this.repository.count({}),
      this.repository.count({ date_from: today }),
      this.repository.count({ date_from: startOfWeek }),
      this.repository.count({ date_from: startOfMonth }),
      this.reviewRepository.getAverageRating({}),
      this.reviewRepository.getRatingDistribution({}),
    ]);

    return {
      total,
      today: todayCount,
      this_week: thisWeekCount,
      this_month: thisMonthCount,
      average_rating: avgRating || 0,
      rating_distribution: ratingDistribution,
    };
  }

  override async getOne(id: string | number | bigint): Promise<ComicReview> {
    const entity = await super.getOne(id);
    // Load comic to verify ownership
    const review = await (this.repository as any).delegate.findFirst({
      where: { id: (this.repository as any).toPrimaryKey(id) },
      include: { comic: true }
    });
    if (review?.comic) {
      verifyGroupOwnership(review.comic as any);
    }
    return entity;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu qua comic
    const review = await (this.repository as any).delegate.findFirst({
      where: { id: (this.repository as any).toPrimaryKey(id) },
      include: { comic: true }
    });
    if (review?.comic) {
      verifyGroupOwnership(review.comic as any);
    }

    return data;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const review = await (this.repository as any).delegate.findFirst({
      where: { id: (this.repository as any).toPrimaryKey(id) },
      include: { comic: true }
    });
    if (review?.comic) {
      verifyGroupOwnership(review.comic as any);
    }
    return true;
  }
}


