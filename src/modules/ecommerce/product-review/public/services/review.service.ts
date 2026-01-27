import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReview, ReviewStatus } from '@/shared/entities/product-review.entity';
import { Product } from '@/shared/entities/product.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { GetReviewsDto } from '../dtos/get-reviews.dto';

@Injectable()
export class PublicReviewService extends CrudService<ProductReview> {
  constructor(
    @InjectRepository(ProductReview)
    protected readonly reviewRepository: Repository<ProductReview>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(reviewRepository);
  }

  /**
   * Get public reviews with filters
   * Only returns approved reviews for public access
   */
  async getReviews(getReviewsDto: GetReviewsDto): Promise<any> {
    const { product_id, rating, status, search, sort, page = 1, limit = 10 } = getReviewsDto;

    const filters: any = {
      status: ReviewStatus.APPROVED, // Only show approved reviews to public
    };
    
    if (product_id) filters.product_id = product_id;
    if (rating) filters.rating = rating;
    if (status) filters.status = status; // Allow override for admin purposes

    const options: any = {
      page,
      limit,
      relations: ['user', 'product'],
      sort: sort || 'created_at:DESC',
    };

    // Add search functionality
    if (search) {
      filters['comment'] = { $like: `%${search}%` };
    }

    return this.getList(filters, options);
  }

  /**
   * Get product review statistics for public display
   * Only counts approved reviews
   */
  async getProductReviewStats(productId: number): Promise<any> {
    // Check if product exists
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const reviews = await this.reviewRepository.find({
      where: { product_id: productId, status: ReviewStatus.APPROVED },
    });

    if (reviews.length === 0) {
      return {
        productId,
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recommendationPercentage: 0,
        verifiedPurchasePercentage: 0,
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    const verifiedPurchases = reviews.filter(review => review.is_verified_purchase).length;
    const verifiedPurchasePercentage = (verifiedPurchases / reviews.length) * 100;
    
    // Calculate recommendation percentage (4+ stars)
    const recommendedReviews = reviews.filter(review => review.rating >= 4).length;
    const recommendationPercentage = (recommendedReviews / reviews.length) * 100;

    return {
      productId,
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution: {
        1: ratingDistribution[1] || 0,
        2: ratingDistribution[2] || 0,
        3: ratingDistribution[3] || 0,
        4: ratingDistribution[4] || 0,
        5: ratingDistribution[5] || 0,
      },
      recommendationPercentage: Math.round(recommendationPercentage),
      verifiedPurchasePercentage: Math.round(verifiedPurchasePercentage),
    };
  }

  /**
   * Mark review as helpful (public endpoint)
   * Anyone can mark a review as helpful
   */
  async markHelpful(reviewId: number): Promise<any> {
    const review = await this.reviewRepository.findOne({ 
      where: { id: reviewId, status: ReviewStatus.APPROVED } 
    });
    
    if (!review) {
      throw new BadRequestException('Review not found or not approved');
    }

    await this.reviewRepository.update(reviewId, {
      helpful_count: review.helpful_count + 1,
    });

    return { 
      success: true, 
      reviewId,
      helpfulCount: review.helpful_count + 1 
    };
  }

  /**
   * Get featured reviews for a product
   * Returns top-rated approved reviews
   */
  async getFeaturedReviews(productId: number, limit = 3): Promise<any> {
    const reviews = await this.reviewRepository.find({
      where: { 
        product_id: productId, 
        status: ReviewStatus.APPROVED 
      },
      relations: ['user'],
      order: { 
        rating: 'DESC', 
        helpful_count: 'DESC',
        created_at: 'DESC' 
      },
      take: limit,
    });

    return reviews;
  }
}