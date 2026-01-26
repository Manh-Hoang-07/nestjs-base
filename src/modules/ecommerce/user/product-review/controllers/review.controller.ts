import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { UpdateReviewDto } from '../dtos/update-review.dto';
import { GetReviewsDto } from '../dtos/get-reviews.dto';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('user/product-reviews')
export class UserReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @LogRequest()
  @Post()
  @UseGuards(JwtAuthGuard)
  @Permission('public')
  async create(@Request() req: any, @Body(ValidationPipe) createDto: CreateReviewDto) {
    const userId = req.user?.id;
    return this.reviewService.createReview(userId, createDto);
  }

  @LogRequest()
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Permission('public')
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateReviewDto,
  ) {
    const userId = req.user?.id;
    return this.reviewService.updateReview(userId, id, updateDto);
  }

  @LogRequest()
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Permission('public')
  async delete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.id;
    return this.reviewService.deleteReview(userId, id);
  }

  @Get()
  @Permission('public')
  async getList(@Request() req: any, @Query(ValidationPipe) query: GetReviewsDto) {
    const userId = req.user?.id;
    return this.reviewService.getReviews(userId, query);
  }

  @Get('product/:productId/stats')
  @Permission('public')
  async getProductStats(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewService.getProductReviewStats(productId);
  }

  @Get('product/:productId/can-review')
  @UseGuards(JwtAuthGuard)
  @Permission('public')
  async canReview(@Request() req: any, @Param('productId', ParseIntPipe) productId: number) {
    const userId = req.user?.id;
    return this.reviewService.canReview(userId, productId);
  }

  @LogRequest()
  @Post(':id/helpful')
  @Permission('public')
  async markHelpful(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.markHelpful(id);
  }
}