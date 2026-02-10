import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ComicReview } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../domain/review.repository';
import { RequestContext } from '@/common/shared/utils';

@Injectable()
export class ReviewsService extends BaseService<ComicReview, IReviewRepository> {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    protected readonly reviewRepository: IReviewRepository,
  ) {
    super(reviewRepository);
  }

  protected override async prepareFilters(filters?: any) {
    // Nếu có user_id trong filters thì giữ nguyên, không thì mặc định là user hiện tại nếu cần
    return filters || {};
  }

  protected override async prepareOptions(options: any = {}) {
    const base = await super.prepareOptions(options);
    return {
      ...base,
      include: options?.include ?? {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
      },
      sort: options?.sort ?? 'created_at:desc',
    };
  }

  async createOrUpdateReview(comicId: number | bigint, rating: number, content?: string) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) throw new UnauthorizedException();

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating phải từ 1 đến 5');
    }

    const existing = await this.repository.findOne({
      user_id: userId,
      comic_id: comicId,
    });

    let review;
    if (existing) {
      review = await this.repository.update(existing.id, {
        rating,
        content,
      });
    } else {
      review = await this.repository.create({
        user_id: userId,
        comic_id: comicId,
        rating,
        content,
      });
    }

    await this.reviewRepository.syncRatingStats(comicId);
    return this.transform(review);
  }

  async removeReview(comicId: number | bigint) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) throw new UnauthorizedException();

    const review = await this.repository.findOne({
      user_id: userId,
      comic_id: comicId,
    });

    if (!review) {
      throw new BadRequestException('Review không tồn tại');
    }

    await this.repository.delete(review.id);
    await this.reviewRepository.syncRatingStats(comicId);

    return { success: true };
  }

  protected override transform(entity: any): any {
    return this.deepConvertBigInt(entity);
  }
}





