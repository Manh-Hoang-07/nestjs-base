import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY, ProjectFilter } from '@/modules/introduction/project/domain/project.repository';
import { BaseContentService } from '@/common/core/services';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectService extends BaseContentService<Project, IProjectRepository> {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepo: IProjectRepository,
  ) {
    super(projectRepo);
  }


  async getSimpleList(query: any) {
    return this.getList({
      ...query,
      limit: query.limit ?? 50,
    });
  }

  protected async beforeCreate(data: any) {
    const payload = { ...data };
    await this.ensureSlug(payload);
    return payload;
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    const payload = { ...data };
    const current = await this.projectRepo.findById(id);
    if (!current) throw new NotFoundException('Project not found');

    await this.ensureSlug(payload, id, (current as any).slug);
    return payload;
  }

  async incrementViewCount(id: number | bigint) {
    return this.projectRepo.incrementViewCount(id);
  }

  protected transform(project: any) {
    if (!project) return project;
    return super.transform(project);
  }
}

