import { Controller, Get, Param, ParseIntPipe, Query, ValidationPipe } from '@nestjs/common';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { Permission } from '@/common/decorators/rbac.decorators';
import { PublicComicsService } from '@/modules/comics/public/comics/services/comics.service';

@Controller('public/comics')
export class PublicComicsController {
  constructor(private readonly comicsService: PublicComicsService) {}

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.comicsService.getList(filters, options);
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

