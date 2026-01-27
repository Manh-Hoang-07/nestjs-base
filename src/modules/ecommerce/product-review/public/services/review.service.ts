import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ProductReview } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../domain/review.repository';
import { GetReviewsDto } from '../dtos/get-reviews.dto';
import { IProductRepository, PRODUCT_REPOSITORY } from '@/modules/ecommerce/product/domain/product.repository';

@Injectable()
export class PublicReviewService extends BaseService<ProductReview, IReviewRepository> {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    protected readonly reviewRepository: IReviewRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {
    super(reviewRepository);
  }

  /**
   * Get public reviews with filters
   * Only returns approved (active) reviews for public access
   */
  async getReviews(getReviewsDto: GetReviewsDto): Promise<any> {
    const { product_id, rating, sort, page = 1, limit = 10 } = getReviewsDto;

    const filter: any = {
      status: 'active', // Only show active reviews to public
    };

    if (product_id) filter.product_id = product_id;
    if (rating) filter.rating = rating;

    return this.getList({ ...filter, page, limit, sort: sort || 'created_at:desc' });
  }

  /**
   * Get product review statistics for public display
   */
  async getProductReviewStats(productId: number): Promise<any> {
    // Check if product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return this.reviewRepository.getStats(productId);
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: number): Promise<any> {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review || review.status !== 'active') {
      throw new BadRequestException('Review not found or not active');
    }

    return this.reviewRepository.update(reviewId, {
      helpful_count: (review as any).helpful_count + 1,
    });
  }

  /**
   * Get featured reviews for a product
   */
  async getFeaturedReviews(productId: number, limit = 3): Promise<any> {
    return this.reviewRepository.findMany({
      product_id: productId,
      status: 'active',
    }, {
      limit,
      sort: 'rating:desc,helpful_count:desc,created_at:desc' as any,
    });
  }
}