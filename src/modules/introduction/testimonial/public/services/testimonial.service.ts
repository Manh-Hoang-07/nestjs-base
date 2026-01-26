import { Injectable, Inject } from '@nestjs/common';
import { ITestimonialRepository, TESTIMONIAL_REPOSITORY, TestimonialFilter } from '@/modules/introduction/testimonial/domain/testimonial.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PublicTestimonialService extends BaseService<any, ITestimonialRepository> {
  constructor(
    @Inject(TESTIMONIAL_REPOSITORY)
    private readonly testimonialRepo: ITestimonialRepository,
  ) {
    super(testimonialRepo);
  }

  async getList(query: any) {
    const filter: TestimonialFilter = {
      status: BasicStatus.active
    };
    if (query.search) filter.search = query.search;
    if (query.projectId) filter.projectId = query.projectId;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      filter,
    });
  }

  async getFeatured(limit: number = 10) {
    const result = await this.getList({ featured: true, limit, page: 1 } as any);
    return result.data as any[];
  }

  async findByProject(projectId: number) {
    const result = await this.getList({ projectId, limit: 100, page: 1 } as any);
    return result.data as any[];
  }

  protected transform(testimonial: any) {
    if (!testimonial) return testimonial;
    const item = super.transform(testimonial) as any;
    if (item.project_id) item.project_id = Number(item.project_id);
    if (item.project) {
      item.project = {
        id: Number(item.project.id),
        name: item.project.name,
        slug: item.project.slug,
      };
    }
    return item;
  }
}

