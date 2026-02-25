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
import { ComicCategoryService } from '../services/comic-category.service';
import { CreateComicCategoryDto } from '../dtos/create-comic-category.dto';
import { UpdateComicCategoryDto } from '../dtos/update-comic-category.dto';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('admin/comic-categories')
export class ComicCategoryController {
  constructor(private readonly comicCategoryService: ComicCategoryService) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query() query: any) {
    return this.comicCategoryService.getList(query);
  }

  @Permission('comic.manage')
  @Get('simple')
  async getSimpleList(@Query() query: any) {
    return this.comicCategoryService.getSimpleList(query);
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.comicCategoryService.getOne(id);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_category_create' })
  @Post()
  async create(@Body(ValidationPipe) dto: CreateComicCategoryDto) {
    return this.comicCategoryService.create(dto);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_category_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateComicCategoryDto,
  ) {
    return this.comicCategoryService.update(id, dto);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_category_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.comicCategoryService.delete(id);
  }
}
