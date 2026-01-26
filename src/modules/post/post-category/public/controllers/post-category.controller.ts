import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { PostCategoryService } from '@/modules/post/post-category/public/services/post-category.service';
import { GetCategoriesDto } from '@/modules/post/post-category/public/dtos/get-categories.dto';
import { GetCategoryDto } from '@/modules/post/post-category/public/dtos/get-category.dto';
import { Permission } from '@/common/auth/decorators';
import { prepareQuery } from '@/common/core/utils';

@Controller('public/post-categories')
export class PostCategoryController {
  constructor(private readonly postCategoryService: PostCategoryService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: GetCategoriesDto) {
    return this.postCategoryService.getList(query);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param(ValidationPipe) dto: GetCategoryDto) {
    return this.postCategoryService.findBySlug(dto.slug);
  }
}

