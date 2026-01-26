import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY, ProjectFilter } from '@/modules/introduction/project/domain/project.repository';
import { ProjectStatus } from '@/shared/enums/types/project-status.enum';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class PublicProjectService extends BaseContentService<any, IProjectRepository> {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepo: IProjectRepository,
  ) {
    super(projectRepo);
  }

  protected async prepareFilters(filter: any) {
    // Public API chỉ hiển thị project completed hoặc in_progress
    return {
      ...filter,
      status: { in: [ProjectStatus.completed, ProjectStatus.in_progress] as any } as any
    };
  }



  async findBySlug(slug: string) {
    const project = await this.projectRepo.findBySlug(slug);
    if (!project) return null;

    // Check status
    const allowed = [ProjectStatus.completed, ProjectStatus.in_progress];
    if (!allowed.includes((project as any).status)) return null;

    // Increment view count
    await this.incrementViewCount(Number(project.id));

    return this.transform(project);
  }

  async getFeatured(limit: number = 10) {
    const result = await this.getList({ isFeatured: true, limit, page: 1 });
    return result.data as any[];
  }

  protected transform(project: any) {
    if (!project) return project;
    const item = super.transform(project) as any;
    if (item.view_count !== undefined) item.view_count = Number(item.view_count);

    // Normalize images
    if (item.images) {
      if (typeof item.images === 'string') {
        try {
          item.images = JSON.parse(item.images);
        } catch (e) {
          item.images = [];
        }
      }
      if (!Array.isArray(item.images)) {
        item.images = [];
      }
    } else {
      item.images = [];
    }

    return item;
  }
}

