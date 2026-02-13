import { Injectable, Inject } from '@nestjs/common';
import { IWardRepository } from '../../domain/ward.repository';
import { BaseService } from '@/common/core/services/base.service';
import { Ward } from '@prisma/client';

@Injectable()
export class WardService extends BaseService<Ward, IWardRepository> {
    constructor(
        @Inject('IWardRepository')
        protected readonly repository: IWardRepository,
    ) {
        super(repository);
    }
}
