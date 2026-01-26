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
import { PostService } from '@/modules/post/post/admin/services/post.service';
import { CreatePostDto } from '@/modules/post/post/admin/dtos/create-post.dto';
import { UpdatePostDto } from '@/modules/post/post/admin/dtos/update-post.dto';
import { GetPostsDto } from '@/modules/post/post/admin/dtos/get-posts.dto';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';

@Controller('admin/posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Permission('post.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: GetPostsDto) {
    return this.postService.getList(query);
  }

  @Permission('post.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    return this.postService.getSimpleList(query);
  }

  @Permission('post.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getOne(id);
  }

  @Permission('post.manage')
  @LogRequest({ fileBaseName: 'post_create' })
  @Post()
  async create(@Body(ValidationPipe) dto: CreatePostDto) {
    return this.postService.create(dto as any);
  }

  @Permission('post.manage')
  @LogRequest({ fileBaseName: 'post_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdatePostDto,
  ) {
    return this.postService.update(id, dto as any);
  }

  @Permission('post.manage')
  @LogRequest({ fileBaseName: 'post_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.postService.delete(id);
  }

  @Permission('post.manage')
  @Get(':id/stats')
  async getStats(
    @Param('id', ParseIntPipe) id: number,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    // Default to last 30 days if dates not provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.postService.getViewStats(id, start, end);
  }

  @Permission('post.manage')
  @Get('statistics/overview')
  async getStatisticsOverview() {
    return this.postService.getStatisticsOverview();
  }
}

