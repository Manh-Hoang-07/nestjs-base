import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITestimonialRepository, TESTIMONIAL_REPOSITORY, TestimonialFilter } from '@/modules/introduction/testimonial/domain/testimonial.repository';
import { IProjectRepository, PROJECT_REPOSITORY } from '@/modules/introduction/project/domain/project.repository';
import { BaseService } from '@/common/core/services';
import { Testimonial } from '@prisma/client';

@Injectable()
export class TestimonialService extends BaseService<Testimonial, ITestimonialRepository> {
  constructor(
    @Inject(TESTIMONIAL_REPOSITORY)
    private readonly testimonialRepo: ITestimonialRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepo: IProjectRepository,
  ) {
    super(testimonialRepo);
  }


  async getSimpleList(query: any) {
    return this.getList({
      ...query,
      limit: query.limit ?? 50,
    });
  }

  protected async beforeCreate(data: any) {
    if (data.project_id) {
      const project = await this.projectRepo.findById(data.project_id);
      if (!project) throw new NotFoundException(`Project with ID ${data.project_id} not found`);
    }
    return data;
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    if (data.project_id) {
      const project = await this.projectRepo.findById(data.project_id);
      if (!project) throw new NotFoundException(`Project with ID ${data.project_id} not found`);
    }
    return data;
  }

  async toggleFeatured(id: number | bigint, featured: boolean) {
    return this.update(id, { featured });
  }

  protected transform(testimonial: any) {
    if (!testimonial) return testimonial;
    const item = super.transform(testimonial) as any;
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

