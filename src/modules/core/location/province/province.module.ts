import { Module } from '@nestjs/common';
import { ProvinceService } from './public/services/province.service';
import { AdminProvinceService } from './admin/services/province.service';
import { ProvinceController } from './public/controllers/province.controller';
import { AdminProvinceController } from './admin/controllers/province.controller';
import { ProvinceRepositoryImpl } from './infrastructure/repositories/province.repository.impl';

@Module({
    controllers: [ProvinceController, AdminProvinceController],
    providers: [
        ProvinceService,
        AdminProvinceService,
        {
            provide: 'IProvinceRepository',
            useClass: ProvinceRepositoryImpl,
        },
    ],
    exports: [ProvinceService, AdminProvinceService, 'IProvinceRepository'],
})
export class ProvinceModule { }
