import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Patch,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '@/modules/introduction/project/admin/services/project.service';
import { CreateProjectDto } from '@/modules/introduction/project/admin/dtos/create-project.dto';
import { UpdateProjectDto } from '@/modules/introduction/project/admin/dtos/update-project.dto';
import { GetProjectsDto } from '@/modules/introduction/project/admin/dtos/get-projects.dto';
import { ProjectStatus } from '@/shared/enums/types/project-status.enum';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { JwtAuthGuard } from '@/common/auth/guards';
import { RbacGuard } from '@/common/auth/guards';
import { ParseBigIntPipe } from '@/common/http/pipes';

@Controller('admin/projects')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @LogRequest()
  @Post()
  @Permission('project.manage')
  create(@Body(ValidationPipe) createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  @Permission('project.manage')
  findAll(@Query(ValidationPipe) query: GetProjectsDto) {
    return this.projectService.getList(query);
  }

  @Get(':id')
  @Permission('project.manage')
  findOne(@Param('id') id: string) {
    return this.projectService.getOne(+id);
  }

  @Put(':id')
  @Permission('project.manage')
  update(@Param('id') id: string, @Body(ValidationPipe) updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @Permission('project.manage')
  remove(@Param('id') id: string) {
    return this.projectService.delete(+id);
  }

  @Patch(':id/status')
  @Permission('project.manage')
  changeStatus(@Param('id') id: string, @Body('status') status: ProjectStatus) {
    return this.projectService.changeStatus(+id, status);
  }

  @Patch(':id/featured')
  @Permission('project.manage')
  toggleFeatured(@Param('id') id: string, @Body('featured') featured: boolean) {
    return this.projectService.toggleFeatured(+id, featured);
  }

  @Patch(':id/sort-order')
  @Permission('project.manage')
  updateSortOrder(@Param('id') id: string, @Body('sort_order') sortOrder: number) {
    return this.projectService.updateSortOrder(+id, sortOrder);
  }
}

