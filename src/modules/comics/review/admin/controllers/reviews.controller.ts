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
} from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('admin/comic-reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    return this.reviewsService.getList(query);
  }

  @Permission('comic.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    return this.reviewsService.getSimpleList(query);
  }

  @Permission('comic.manage')
  @Get('statistics')
  async getStatistics() {
    return this.reviewsService.getStatistics();
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getOne(id);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'review_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: { content?: string; rating?: number },
  ) {
    return this.reviewsService.update(id, body);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'review_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.delete(id);
  }
}
