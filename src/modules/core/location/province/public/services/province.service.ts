import { Injectable, Inject } from '@nestjs/common';
import { IProvinceRepository } from '../../domain/province.repository';
import { BaseService } from '@/common/core/services/base.service';
import { Province } from '@prisma/client';

@Injectable()
export class ProvinceService extends BaseService<Province, IProvinceRepository> {
    constructor(
        @Inject('IProvinceRepository')
        protected readonly repository: IProvinceRepository,
    ) {
        super(repository);
    }
}
