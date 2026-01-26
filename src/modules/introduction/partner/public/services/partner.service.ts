import { Injectable, Inject } from '@nestjs/common';
import { IPartnerRepository, PARTNER_REPOSITORY, PartnerFilter } from '@/modules/introduction/partner/domain/partner.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { PartnerType } from '@/shared/enums/types/partner-type.enum';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PublicPartnerService extends BaseService<any, IPartnerRepository> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepo: IPartnerRepository,
  ) {
    super(partnerRepo);
  }

  async getList(query: any) {
    const filter: PartnerFilter = {
      status: BasicStatus.active
    };
    if (query.search) filter.search = query.search;
    if (query.type) filter.type = query.type;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      filter,
    });
  }

  async findByType(type: PartnerType) {
    const result = await this.getList({ type, limit: 100, page: 1 } as any);
    return result.data as any[];
  }
}

