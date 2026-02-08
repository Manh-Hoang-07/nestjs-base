import { Controller, Get, Param, ParseIntPipe, Query, ValidationPipe } from '@nestjs/common';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { PublicComicsService } from '../services/comic.service';

@Controller('public/comics')
export class PublicComicsController {
  constructor(private readonly comicsService: PublicComicsService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    return this.comicsService.getList(query);
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

