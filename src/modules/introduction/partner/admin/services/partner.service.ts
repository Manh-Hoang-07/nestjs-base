import { Injectable, Inject } from '@nestjs/common';
import { IPartnerRepository, PARTNER_REPOSITORY, PartnerFilter } from '@/modules/introduction/partner/domain/partner.repository';
import { BaseContentService } from '@/common/core/services';
import { Partner } from '@prisma/client';

@Injectable()
export class PartnerService extends BaseContentService<Partner, IPartnerRepository> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepo: IPartnerRepository,
  ) {
    super(partnerRepo);
  }

  protected defaultSort = 'sort_order:asc,created_at:desc';


  async getSimpleList(query: any) {
    return this.getList({
      ...query,
      limit: query.limit ?? 50,
    });
  }
}

