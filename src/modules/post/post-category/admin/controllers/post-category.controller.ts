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
import { PostCategoryService } from '@/modules/post/post-category/admin/services/post-category.service';
import { CreatePostCategoryDto } from '@/modules/post/post-category/admin/dtos/create-post-category.dto';
import { UpdatePostCategoryDto } from '@/modules/post/post-category/admin/dtos/update-post-category.dto';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';

@Controller('admin/post-categories')
export class PostCategoryController {
  constructor(private readonly postCategoryService: PostCategoryService) { }

  @Permission('post_category.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    return this.postCategoryService.getList(query);
  }

  @Permission('post_category.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    return this.postCategoryService.getSimpleList(query);
  }

  @Permission('post_category.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.postCategoryService.getOne(id);
  }

  @Permission('post_category.manage')
  @LogRequest()
  @Post()
  async create(@Body(ValidationPipe) createDto: CreatePostCategoryDto) {
    return this.postCategoryService.create(createDto as any);
  }

  @Permission('post_category.manage')
  @LogRequest()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdatePostCategoryDto,
  ) {
    return this.postCategoryService.update(id, updateDto as any);
  }

  @Permission('post_category.manage')
  @LogRequest()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.postCategoryService.delete(id);
  }
}

