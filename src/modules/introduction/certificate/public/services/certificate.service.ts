import { Injectable, Inject } from '@nestjs/common';
import { Certificate } from '@prisma/client';
import { ICertificateRepository, CERTIFICATE_REPOSITORY, CertificateFilter } from '@/modules/introduction/certificate/domain/certificate.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { CertificateType } from '@/shared/enums/types/certificate-type.enum';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PublicCertificateService extends BaseService<Certificate, ICertificateRepository> {
  constructor(
    @Inject(CERTIFICATE_REPOSITORY)
    private readonly certificateRepo: ICertificateRepository,
  ) {
    super(certificateRepo);
  }

  protected async prepareFilters(filter: any) {
    // Public API chỉ hiển thị active
    return { ...filter, status: BasicStatus.active as any };
  }



  async findByType(type: CertificateType): Promise<Certificate[]> {
    const result = await this.getList({
      type,
      limit: 100,
      page: 1,
    });
    return result.data;
  }
}
