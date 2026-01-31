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
import { ReadingHistoryService } from '../services/reading-history.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('user/reading-history')
export class ReadingHistoryController {
  constructor(private readonly readingHistoryService: ReadingHistoryService) { }

  @Permission('authenticated')
  @Get()
  async getList() {
    return this.readingHistoryService.getList();
  }

  @Permission('authenticated')
  @Post()
  async updateOrCreate(@Body(ValidationPipe) body: { comic_id: number; chapter_id: number }) {
    return this.readingHistoryService.updateOrCreate(body.comic_id, body.chapter_id);
  }

  @Permission('authenticated')
  @Delete(':comicId')
  async delete(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.readingHistoryService.clearHistory(comicId);
  }
}



