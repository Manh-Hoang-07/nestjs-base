import { Injectable, Inject } from '@nestjs/common';
import { Faq } from '@prisma/client';
import { IFaqRepository, FAQ_REPOSITORY, FaqFilter } from '@/modules/introduction/faq/domain/faq.repository';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class FaqService extends BaseContentService<Faq, IFaqRepository> {
  constructor(
    @Inject(FAQ_REPOSITORY)
    private readonly faqRepo: IFaqRepository,
  ) {
    super(faqRepo);
  }

  protected defaultSort = 'sort_order:asc,created_at:desc';

}

