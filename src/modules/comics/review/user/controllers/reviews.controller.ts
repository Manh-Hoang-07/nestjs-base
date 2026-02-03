import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from '../services/reviews.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { SanitizeHtmlPipe } from '@/modules/comics/shared/pipes/sanitize-html.pipe';

@Controller('user/comic-reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Permission('authenticated')
  @Get()
  async getMyReviews() {
    return this.reviewsService.getList({ by_current_user: true });
  }

  @Permission('authenticated')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 reviews per minute
  @Post('comics/:comicId')
  @UsePipes(new SanitizeHtmlPipe())
  async createOrUpdate(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Body(ValidationPipe) body: { rating: number; content?: string },
  ) {
    return this.reviewsService.createOrUpdateReview(comicId, body.rating, body.content);
  }

  @Permission('authenticated')
  @Delete('comics/:comicId')
  async delete(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.reviewsService.removeReview(comicId);
  }
}
