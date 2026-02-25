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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComicService } from '../services/comic.service';
import { CreateComicDto } from '../dtos/create-comic.dto';
import { UpdateComicDto } from '../dtos/update-comic.dto';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { UploadService } from '@/modules/storage/file-upload/services/upload.service';
import { ImageValidator } from '@/modules/comics/shared/validators/image-validator';

@Controller('admin/comics')
export class ComicController {
  constructor(
    private readonly comicService: ComicService,
    private readonly uploadService: UploadService,
  ) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query() query: any) {
    return this.comicService.getList(query);
  }

  @Permission('comic.manage')
  @Get('simple')
  async getSimpleList(@Query() query: any) {
    return this.comicService.getSimpleList(query);
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.comicService.getOne(id);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_create' })
  @Post()
  async create(@Body(ValidationPipe) dto: CreateComicDto) {
    return this.comicService.create(dto);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateComicDto,
  ) {
    return this.comicService.update(id, dto);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.comicService.delete(id);
  }



  @Permission('comic.manage')
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Validate image
    ImageValidator.validate(file);

    const uploadResult = await this.uploadService.uploadFile(file);
    const comic = await this.comicService.getOne(id);
    if (!comic) {
      throw new Error('Comic not found');
    }

    return this.comicService.update(id, { cover_image: uploadResult.url });
  }
}
