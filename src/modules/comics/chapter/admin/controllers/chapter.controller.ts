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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChapterService } from '../services/chapter.service';
import { CreateChapterDto } from '../dtos/create-chapter.dto';
import { UpdateChapterDto } from '../dtos/update-chapter.dto';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { UploadService } from '@/modules/storage/file-upload/services/upload.service';
import { ImageValidator } from '@/modules/comics/shared/validators/image-validator';

@Controller('admin/chapters')
export class ChapterController {
  constructor(
    private readonly chapterService: ChapterService,
    private readonly uploadService: UploadService,
  ) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query() query: any) {
    return this.chapterService.getList(query);
  }

  @Permission('comic.manage')
  @Get('simple')
  async getSimpleList(@Query() query: any) {
    return this.chapterService.getSimpleList(query);
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.chapterService.getOne(id);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'chapter_create' })
  @Post()
  async create(@Body(ValidationPipe) dto: CreateChapterDto) {
    return this.chapterService.create(dto);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'chapter_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateChapterDto,
  ) {
    return this.chapterService.update(id, dto);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'chapter_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.chapterService.delete(id);
  }

  @Permission('comic.manage')
  @Post(':id/pages')
  @UseInterceptors(FilesInterceptor('files', 100))
  async uploadPages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Validate images
    ImageValidator.validateMultiple(files);

    // Upload files và lấy URLs
    const uploadResults = await this.uploadService.uploadFiles(files);

    // Tạo pages data
    const pages = uploadResults.map((result) => ({
      image_url: result.url,
      width: undefined,
      height: undefined,
      file_size: result.size,
    }));

    return this.chapterService.updatePages(id, pages);
  }

  @Permission('comic.manage')
  @Put(':id/pages')
  async updatePages(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: {
      pages: Array<{
        image_url: string;
        width?: number;
        height?: number;
        file_size?: number;
      }>;
    },
  ) {
    return this.chapterService.updatePages(id, body.pages);
  }


}
