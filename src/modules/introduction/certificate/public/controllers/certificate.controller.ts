import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicCertificateService } from '@/modules/introduction/certificate/public/services/certificate.service';
import { CertificateType } from '@/shared/enums/types/certificate-type.enum';
import { prepareQuery } from '@/common/core/utils';
import { Permission } from '@/common/auth/decorators';

@Controller('certificates')
export class PublicCertificateController {
  constructor(private readonly certificateService: PublicCertificateService) { }

  @Permission('public')
  @Get()
  findAll(@Query() query: any) {
    return this.certificateService.getList(query);
  }

  @Permission('public')
  @Get('type/:type')
  findByType(@Param('type') type: CertificateType) {
    return this.certificateService.findByType(type);
  }

  @Permission('public')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificateService.getOne(Number(id));
  }
}

