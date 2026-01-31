import { Controller, Get, Param, ParseIntPipe, Query, ValidationPipe } from '@nestjs/common';
import { prepareQuery } from '@/common/core/utils/list-query.helper';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { PublicComicsService } from '../services/comic.service';

@Controller('public/comics')
export class PublicComicsController {
  constructor(private readonly comicsService: PublicComicsService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    return this.comicsService.getList({ filter, ...options });
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.comicsService.getBySlug(slug);
  }

  @Permission('public')
  @Get(':slug/chapters')
  async getChaptersBySlug(@Param('slug') slug: string) {
    return this.comicsService.getChaptersBySlug(slug);
  }
}

