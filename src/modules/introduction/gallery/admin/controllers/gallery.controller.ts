import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { GalleryService } from '@/modules/introduction/gallery/admin/services/gallery.service';
import { CreateGalleryDto } from '@/modules/introduction/gallery/admin/dtos/create-gallery.dto';
import { UpdateGalleryDto } from '@/modules/introduction/gallery/admin/dtos/update-gallery.dto';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { JwtAuthGuard } from '@/common/auth/guards';
import { RbacGuard } from '@/common/auth/guards';

@Controller('admin/gallery')
@UseGuards(JwtAuthGuard, RbacGuard)
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) { }

  @LogRequest()
  @Post()
  @Permission('gallery.manage')
  create(@Body(ValidationPipe) createGalleryDto: CreateGalleryDto) {
    return this.galleryService.create(createGalleryDto);
  }

  @Get()
  @Permission('gallery.manage')
  findAll(@Query(ValidationPipe) query: any) {
    return this.galleryService.getList(query);
  }

  @Get(':id')
  @Permission('gallery.manage')
  findOne(@Param('id') id: string) {
    return this.galleryService.getOne(+id);
  }

  @Put(':id')
  @Permission('gallery.manage')
  update(@Param('id') id: string, @Body(ValidationPipe) updateGalleryDto: UpdateGalleryDto) {
    return this.galleryService.update(+id, updateGalleryDto);
  }

  @Delete(':id')
  @Permission('gallery.manage')
  remove(@Param('id') id: string) {
    return this.galleryService.delete(+id);
  }
}

