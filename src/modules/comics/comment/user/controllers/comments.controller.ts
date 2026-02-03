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
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserCommentsService } from '../services/comments.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { SanitizeHtmlPipe } from '@/modules/comics/shared/pipes/sanitize-html.pipe';

@Controller('user/comic-comments')
export class UserCommentsController {
  constructor(private readonly commentsService: UserCommentsService) { }

  @Permission('authenticated')
  @Get()
  async getMyComments(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.commentsService.getList({ by_current_user: true, page, limit });
  }

  @Permission('authenticated')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 comments per minute
  @Post()
  @UsePipes(new SanitizeHtmlPipe())
  async create(@Body(ValidationPipe) body: {
    comic_id: number;
    chapter_id?: number;
    parent_id?: number;
    content: string;
  }) {
    return this.commentsService.create(body);
  }

  @Permission('authenticated')
  @Put(':id')
  @UsePipes(new SanitizeHtmlPipe())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: { content: string },
  ) {
    return this.commentsService.updateComment(id, body.content);
  }

  @Permission('authenticated')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.removeComment(id);
  }
}
