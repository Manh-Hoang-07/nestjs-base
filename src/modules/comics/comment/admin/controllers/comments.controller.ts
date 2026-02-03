import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from '../services/comments.service';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('admin/comic-comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query() query: any) {
    return this.commentsService.getList(query);
  }

  @Permission('comic.manage')
  @Get('statistics')
  async getStatistics() {
    return this.commentsService.getStatistics();
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.getOne(id);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comment_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: { content?: string; status?: 'visible' | 'hidden' },
  ) {
    return this.commentsService.update(id, body);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comment_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.delete(id);
  }
}
