import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { PublicComicCategoriesService } from '@/modules/comics/comic-category/public/services/comic-category.service';
import { GetComicCategoriesDto } from '@/modules/comics/comic-category/public/dtos/get-categories.dto';
import { GetComicCategoryDto } from '@/modules/comics/comic-category/public/dtos/get-category.dto';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('public/comic-categories')
export class PublicComicCategoriesController {
  constructor(private readonly comicCategoriesService: PublicComicCategoriesService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: GetComicCategoriesDto) {
    return this.comicCategoriesService.getList(query);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param(ValidationPipe) dto: GetComicCategoryDto) {
    return this.comicCategoriesService.getOne({ slug: dto.slug } as any);
  }
}

