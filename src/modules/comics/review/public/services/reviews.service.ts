import { Injectable, Inject } from '@nestjs/common';
import { toPlain } from '@/common/shared/utils';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../domain/review.repository';

@Injectable()
export class PublicReviewsService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
  ) { }

  /**
   * Lấy danh sách reviews của comic
   */
  async getByComic(comicId: number, page: number = 1, limit: number = 20) {
    const { data: reviews, meta } = await this.reviewRepository.findAll({
      filter: { comic_id: comicId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      },
      sort: 'created_at:DESC',
      page,
      limit,
    } as any);

    return {
      data: toPlain(reviews),
      meta,
    };
  }
}
