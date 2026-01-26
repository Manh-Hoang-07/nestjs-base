import { Injectable, Inject } from '@nestjs/common';
import { IAboutRepository, ABOUT_REPOSITORY, AboutFilter } from '@/modules/introduction/about/domain/about.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { AboutSectionType } from '@/shared/enums/types/about-section-type.enum';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PublicAboutService extends BaseService<any, IAboutRepository> {
  constructor(
    @Inject(ABOUT_REPOSITORY)
    private readonly aboutRepo: IAboutRepository,
  ) {
    super(aboutRepo);
  }

  protected async prepareFilters(filter: any) {
    // Public API chỉ hiển thị active
    return { ...filter, status: BasicStatus.active };
  }



  async findBySlug(slug: string): Promise<any | null> {
    const about = await this.aboutRepo.findBySlug(slug);
    return this.transform(about);
  }

  async findByType(type: AboutSectionType): Promise<any[]> {
    const result = await this.getList({
      section_type: type,
      limit: 100,
      page: 1,
    });
    return result.data as any[];
  }
}

