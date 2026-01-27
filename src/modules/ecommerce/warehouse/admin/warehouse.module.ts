import { Module } from '@nestjs/common';
import { AdminWarehouseService } from './services/warehouse.service';
import { AdminWarehouseController } from './controllers/warehouse.controller';
import { WarehouseRepositoryModule } from '../warehouse.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    WarehouseRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminWarehouseController],
  providers: [AdminWarehouseService],
  exports: [AdminWarehouseService],
})
export class AdminWarehouseModule { }