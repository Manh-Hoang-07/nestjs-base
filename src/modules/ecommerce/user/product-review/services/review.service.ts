import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReview, ReviewStatus } from '@/shared/entities/product-review.entity';
import { Product } from '@/shared/entities/product.entity';
import { Order } from '@/shared/entities/order.entity';
import { OrderItem } from '@/shared/entities/order-item.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { UpdateReviewDto } from '../dtos/update-review.dto';
import { GetReviewsDto } from '../dtos/get-reviews.dto';
import { PaymentStatus } from '@/shared/enums/payment-status.enum';

@Injectable()
export class ReviewService extends CrudService<ProductReview> {
  constructor(
    @InjectRepository(ProductReview)
    protected readonly reviewRepository: Repository<ProductReview>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {
    super(reviewRepository);
  }

  /**
   * Create a product review
   */
  async createReview(userId: number, createReviewDto: CreateReviewDto): Promise<any> {
    const { product_id, order_id, rating, title, comment, images } = createReviewDto;

    // Check if product exists
    const product = await this.productRepository.findOne({ where: { id: product_id } });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: { product_id, user_id: userId },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    let isVerifiedPurchase = false;

    // If order_id provided, verify purchase
    if (order_id) {
      const order = await this.orderRepository.findOne({
        where: { id: order_id, user_id: userId },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      // Check if order is paid
      if (order.payment_status !== PaymentStatus.PAID) {
        throw new BadRequestException('Order must be paid to leave a review');
      }

      // Check if product is in the order
      const orderItem = await this.orderItemRepository.findOne({
        where: { order_id, product_id },
      });

      if (!orderItem) {
        throw new BadRequestException('Product not found in this order');
      }

      isVerifiedPurchase = true;
    }

    // Create review
    const review = await this.create({
      product_id,
      user_id: userId,
      order_id,
      rating,
      title,
      comment,
      images,
      is_verified_purchase: isVerifiedPurchase,
      status: ReviewStatus.PENDING,
      created_user_id: userId,
    } as any);

    return review;
  }

  /**
   * Update a review (only by the review owner)
   */
  async updateReview(userId: number, reviewId: number, updateReviewDto: UpdateReviewDto): Promise<any> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user_id: userId },
    });

    if (!review) {
      throw new BadRequestException('Review not found or you do not have permission to update it');
    }

    // Only allow updates if review is not approved yet
    if (review.status === ReviewStatus.APPROVED) {
      throw new BadRequestException('Cannot update an approved review');
    }

    return this.update(reviewId, {
      ...updateReviewDto,
      status: ReviewStatus.PENDING, // Reset to pending after update
      updated_user_id: userId,
    } as any);
  }

  /**
   * Delete a review (only by the review owner)
   */
  async deleteReview(userId: number, reviewId: number): Promise<any> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user_id: userId },
    });

    if (!review) {
      throw new BadRequestException('Review not found or you do not have permission to delete it');
    }

    return this.softDelete(reviewId);
  }

  /**
   * Get reviews with filters
   */
  async getReviews(userId: number, getReviewsDto: GetReviewsDto): Promise<any> {
    const { product_id, rating, status, sort, page = 1, limit = 10 } = getReviewsDto;

    const filters: any = {
      user_id: userId, // Always filter by current user
    };
    if (product_id) filters.product_id = product_id;
    if (rating) filters.rating = rating;
    if (status) filters.status = status;

    const options = {
      page,
      limit,
      relations: ['user', 'product'],
      sort: sort || 'created_at:DESC',
    };

    return this.getList(filters, options);
  }

  /**
   * Get product review statistics
   */
  async getProductReviewStats(productId: number): Promise<any> {
    const reviews = await this.reviewRepository.find({
      where: { product_id: productId, status: ReviewStatus.APPROVED },
    });

    if (reviews.length === 0) {
      return {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    return {
      total_reviews: reviews.length,
      average_rating: Math.round(averageRating * 10) / 10,
      rating_distribution: {
        1: ratingDistribution[1] || 0,
        2: ratingDistribution[2] || 0,
        3: ratingDistribution[3] || 0,
        4: ratingDistribution[4] || 0,
        5: ratingDistribution[5] || 0,
      },
    };
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: number): Promise<any> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new BadRequestException('Review not found');
    }

    await this.reviewRepository.update(reviewId, {
      helpful_count: review.helpful_count + 1,
    });

    return { success: true, helpful_count: review.helpful_count + 1 };
  }

  /**
   * Check if user can review a product
   */
  async canReview(userId: number, productId: number): Promise<boolean> {
    // Check if user already reviewed
    const existingReview = await this.reviewRepository.findOne({
      where: { product_id: productId, user_id: userId },
    });

    if (existingReview) {
      return false;
    }

    // Check if user purchased the product
    const orders = await this.orderRepository.find({
      where: { user_id: userId, payment_status: PaymentStatus.PAID },
    });

    const orderIds = orders.map(order => order.id);
    if (orderIds.length === 0) {
      return false;
    }

    const orderItem = await this.orderItemRepository.findOne({
      where: { order_id: orderIds[0], product_id: productId },
    });

    return !!orderItem;
  }

}