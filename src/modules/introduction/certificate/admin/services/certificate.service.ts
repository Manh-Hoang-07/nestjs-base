import { Injectable, Inject } from '@nestjs/common';
import { Certificate } from '@prisma/client';
import { ICertificateRepository, CERTIFICATE_REPOSITORY, CertificateFilter } from '@/modules/introduction/certificate/domain/certificate.repository';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class CertificateService extends BaseContentService<Certificate, ICertificateRepository> {
  constructor(
    @Inject(CERTIFICATE_REPOSITORY)
    private readonly certificateRepo: ICertificateRepository,
  ) {
    super(certificateRepo);
  }

  protected defaultSort = 'sort_order:asc,created_at:desc';

  async getList(query: any) {
    const filter: CertificateFilter = {};
    if (query.search) filter.search = query.search;
    if (query.status) filter.status = query.status;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      filter,
    });
  }
}

