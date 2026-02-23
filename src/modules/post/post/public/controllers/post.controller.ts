import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from '@/modules/post/post/public/services/post.service';
import { GetPostsDto } from '@/modules/post/post/public/dtos/get-posts.dto';
import { GetPostDto } from '@/modules/post/post/public/dtos/get-post.dto';
import { Permission } from '@/common/auth/decorators';
import { prepareQuery } from '@/common/core/utils';
import { CacheInterceptor, Cacheable } from '@/common/cache';

@Controller('public/posts')
@UseInterceptors(CacheInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Permission('public')
  @Cacheable({ key: 'posts:list:${query.page}:${query.limit}:${query.category_slug}', ttl: 600 })
  @Get()
  async getList(@Query(ValidationPipe) query: GetPostsDto) {
    return this.postService.getList(query);
  }

  @Permission('public')
  @Cacheable({ key: 'posts:featured:${limit}', ttl: 3600 })
  @Get('featured')
  async getFeatured(@Query('limit') limit?: string) {
    const dto = new GetPostsDto();
    dto.is_featured = true;
    dto.page = 1;
    dto.limit = limit ? parseInt(limit, 10) : 5;
    return this.postService.getList(dto);
  }

  @Permission('public')
  @Cacheable({ key: 'posts:slug:${dto.slug}', ttl: 3600 })
  @Get(':slug')
  async getBySlug(@Param(ValidationPipe) dto: GetPostDto) {
    return this.postService.getOne(dto.slug);
  }
}

