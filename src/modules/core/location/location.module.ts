import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module';
import { ProvinceModule } from './province/province.module';
import { WardModule } from './ward/ward.module';

@Module({
    imports: [
        CountryModule,
        ProvinceModule,
        WardModule,
    ],
    exports: [
        CountryModule,
        ProvinceModule,
        WardModule,
    ],
})
export class LocationModule { }
