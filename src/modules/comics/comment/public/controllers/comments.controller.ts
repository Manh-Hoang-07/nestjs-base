import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PublicCommentsService } from '../services/comments.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('public/comic-comments')
export class PublicCommentsController {
  constructor(private readonly commentsService: PublicCommentsService) { }

  @Permission('public')
  @Get('comics/:comicId')
  async getByComic(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.commentsService.getByComic(comicId, isNaN(pageNum) ? 1 : pageNum, isNaN(limitNum) ? 20 : limitNum);
  }

  @Permission('public')
  @Get('chapters/:chapterId')
  async getByChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.commentsService.getByChapter(chapterId, isNaN(pageNum) ? 1 : pageNum, isNaN(limitNum) ? 20 : limitNum);
  }
}
