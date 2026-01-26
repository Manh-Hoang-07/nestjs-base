import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { PublicGalleryService } from '@/modules/introduction/gallery/public/services/gallery.service';
import { prepareQuery } from '@/common/core/utils';
import { Permission } from '@/common/auth/decorators';

@Controller('gallery')
export class PublicGalleryController {
  constructor(private readonly galleryService: PublicGalleryService) { }

  @Permission('public')
  @Get()
  findAll(@Query() query: any) {
    return this.galleryService.getList(query);
  }

  @Permission('public')
  @Get('featured')
  getFeatured(@Query('limit') limit?: number) {
    return this.galleryService.getFeatured(limit ? Number(limit) : 10);
  }

  @Permission('public')
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const gallery = await this.galleryService.findBySlug(slug);
    if (!gallery) {
      throw new NotFoundException(`Gallery with slug "${slug}" not found`);
    }
    return gallery;
  }
}

