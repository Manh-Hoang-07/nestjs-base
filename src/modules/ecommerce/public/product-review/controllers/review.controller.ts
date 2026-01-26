import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { PublicReviewService } from '../services/review.service';
import { GetReviewsDto } from '../dtos/get-reviews.dto';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('public/product-reviews')
export class PublicReviewController {
  constructor(private readonly reviewService: PublicReviewService) {}

  @Get()
  @Permission('public')
  async getList(@Query(ValidationPipe) query: GetReviewsDto) {
    return this.reviewService.getReviews(query);
  }

  @Get('product/:productId/stats')
  @Permission('public')
  async getProductStats(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewService.getProductReviewStats(productId);
  }

  @Get('product/:productId/featured')
  @Permission('public')
  async getFeaturedReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('limit', ParseIntPipe) limit = 3,
  ) {
    return this.reviewService.getFeaturedReviews(productId, limit);
  }

  @LogRequest()
  @Post(':id/helpful')
  @Permission('public')
  async markHelpful(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.markHelpful(id);
  }
}