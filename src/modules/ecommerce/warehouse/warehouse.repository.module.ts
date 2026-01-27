import { Module } from '@nestjs/common';
import { WAREHOUSE_REPOSITORY } from './domain/warehouse.repository';
import { WarehouseRepositoryImpl } from './infrastructure/repositories/warehouse.repository.impl';
import { WAREHOUSE_INVENTORY_REPOSITORY } from './domain/warehouse-inventory.repository';
import { WarehouseInventoryRepositoryImpl } from './infrastructure/repositories/warehouse-inventory.repository.impl';

@Module({
    providers: [
        {
            provide: WAREHOUSE_REPOSITORY,
            useClass: WarehouseRepositoryImpl,
        },
        {
            provide: WAREHOUSE_INVENTORY_REPOSITORY,
            useClass: WarehouseInventoryRepositoryImpl,
        },
    ],
    exports: [WAREHOUSE_REPOSITORY, WAREHOUSE_INVENTORY_REPOSITORY],
})
export class WarehouseRepositoryModule { }
