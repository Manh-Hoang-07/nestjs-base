import { Injectable, Inject } from '@nestjs/common';
import { ICountryRepository } from '../../domain/country.repository';
import { BaseService } from '@/common/core/services/base.service';
import { Country } from '@prisma/client';

@Injectable()
export class AdminCountryService extends BaseService<Country, ICountryRepository> {
    constructor(
        @Inject('ICountryRepository')
        protected readonly repository: ICountryRepository,
    ) {
        super(repository);
    }
}
