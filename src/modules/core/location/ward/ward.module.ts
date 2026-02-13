import { Module } from '@nestjs/common';
import { WardService } from './public/services/ward.service';
import { AdminWardService } from './admin/services/ward.service';
import { WardController } from './public/controllers/ward.controller';
import { AdminWardController } from './admin/controllers/ward.controller';
import { WardRepositoryImpl } from './infrastructure/repositories/ward.repository.impl';

@Module({
    controllers: [WardController, AdminWardController],
    providers: [
        WardService,
        AdminWardService,
        {
            provide: 'IWardRepository',
            useClass: WardRepositoryImpl,
        },
    ],
    exports: [WardService, AdminWardService, 'IWardRepository'],
})
export class WardModule { }
