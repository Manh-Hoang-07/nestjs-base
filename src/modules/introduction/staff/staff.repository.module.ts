import { Global, Module } from '@nestjs/common';
import { STAFF_REPOSITORY } from './domain/staff.repository';
import { StaffRepositoryImpl } from './infrastructure/repositories/staff.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: STAFF_REPOSITORY,
            useClass: StaffRepositoryImpl,
        },
    ],
    exports: [STAFF_REPOSITORY],
})
export class StaffRepositoryModule { }
