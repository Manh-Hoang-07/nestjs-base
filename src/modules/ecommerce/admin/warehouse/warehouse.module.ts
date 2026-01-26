import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from '@/shared/entities/warehouse.entity';
import { WarehouseInventory } from '@/shared/entities/warehouse-inventory.entity';
import { StockTransfer } from '@/shared/entities/stock-transfer.entity';
import { AdminWarehouseController } from './controllers/warehouse.controller';
import { WarehouseService } from './services/warehouse.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, WarehouseInventory, StockTransfer]),
    RbacModule,
  ],
  controllers: [AdminWarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class AdminWarehouseModule { }