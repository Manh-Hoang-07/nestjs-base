import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { PublicAboutService } from '@/modules/introduction/about/public/services/about.service';
import { AboutSectionType } from '@/shared/enums/types/about-section-type.enum';
import { prepareQuery } from '@/common/core/utils';
import { Permission } from '@/common/auth/decorators';

@Controller('about-sections')
export class PublicAboutController {
  constructor(private readonly aboutService: PublicAboutService) { }

  @Permission('public')
  @Get()
  findAll(@Query() query: any) {
    return this.aboutService.getList(query);
  }

  @Permission('public')
  @Get('type/:type')
  findByType(@Param('type') type: AboutSectionType) {
    return this.aboutService.findByType(type);
  }

  @Permission('public')
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const section = await this.aboutService.findBySlug(slug);
    if (!section) {
      throw new NotFoundException(`About section with slug "${slug}" not found`);
    }
    return section;
  }
}

