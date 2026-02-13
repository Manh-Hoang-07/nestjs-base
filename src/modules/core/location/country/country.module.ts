import { Module } from '@nestjs/common';
import { CountryService } from './public/services/country.service';
import { AdminCountryService } from './admin/services/country.service';
import { CountryController } from './public/controllers/country.controller';
import { AdminCountryController } from './admin/controllers/country.controller';
import { CountryRepositoryImpl } from './infrastructure/repositories/country.repository.impl';

@Module({
    controllers: [CountryController, AdminCountryController],
    providers: [
        CountryService,
        AdminCountryService,
        {
            provide: 'ICountryRepository',
            useClass: CountryRepositoryImpl,
        },
    ],
    exports: [CountryService, AdminCountryService, 'ICountryRepository'],
})
export class CountryModule { }
