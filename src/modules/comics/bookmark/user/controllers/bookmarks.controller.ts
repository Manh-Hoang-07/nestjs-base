import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { BookmarksService } from '@/modules/comics/bookmark/user/services/bookmarks.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('user/bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) { }

  @Permission('authenticated')
  @Get()
  async getList() {
    return this.bookmarksService.getList();
  }

  @Permission('authenticated')
  @Post()
  async create(@Body(ValidationPipe) body: { chapter_id: number; page_number: number }) {
    return this.bookmarksService.createBookmark(body.chapter_id, body.page_number);
  }

  @Permission('authenticated')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.bookmarksService.removeBookmark(id);
  }
}



