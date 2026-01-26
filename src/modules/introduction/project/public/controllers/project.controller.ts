import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { PublicProjectService } from '@/modules/introduction/project/public/services/project.service';
import { prepareQuery } from '@/common/core/utils';
import { Permission } from '@/common/auth/decorators';

@Controller('projects')
export class PublicProjectController {
  constructor(private readonly projectService: PublicProjectService) { }

  @Permission('public')
  @Get()
  findAll(@Query() query: any) {
    return this.projectService.getList(query);
  }

  @Permission('public')
  @Get('featured')
  getFeatured(@Query('limit') limit?: number) {
    return this.projectService.getFeatured(limit ? Number(limit) : 10);
  }

  @Permission('public')
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const project = await this.projectService.findBySlug(slug);
    if (!project) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }
    return project;
  }
}

