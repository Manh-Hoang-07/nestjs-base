import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Faq } from '@prisma/client';
import { IFaqRepository, FAQ_REPOSITORY, FaqFilter } from '@/modules/introduction/faq/domain/faq.repository';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class PublicFaqService extends BaseContentService<Faq, IFaqRepository> {
  constructor(
    @Inject(FAQ_REPOSITORY)
    private readonly faqRepo: IFaqRepository,
  ) {
    super(faqRepo);
  }

  async getList(query: any) {
    const filter: FaqFilter = {
      status: 'active',
    };
    if (query.search) filter.search = query.search;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort || 'sort_order:asc,created_at:desc',
      filter,
    });
  }

  async getOne(id: number) {
    const faq = await super.getOne(id);
    if (!faq || (faq as any).status !== 'active') {
      throw new NotFoundException('FAQ not found or inactive');
    }
    return faq;
  }

  async getPopular(limit: number = 10) {
    const result = await this.faqRepo.findAll({
      page: 1,
      limit,
      sort: 'view_count:desc',
      filter: { status: 'active' },
    });
    return result.data.map(item => this.transform(item));
  }

  async incrementHelpfulCount(id: number) {
    return this.faqRepo.incrementHelpfulCount(id);
  }

  protected transform(faq: any) {
    if (!faq) return faq;
    const item = super.transform(faq) as any;
    if (item.view_count) item.view_count = Number(item.view_count);
    if (item.helpful_count) item.helpful_count = Number(item.helpful_count);
    return item;
  }
}

