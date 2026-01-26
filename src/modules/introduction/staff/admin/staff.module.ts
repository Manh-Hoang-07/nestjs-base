import { Module } from '@nestjs/common';
import { StaffService } from '@/modules/introduction/staff/admin/services/staff.service';
import { StaffController } from '@/modules/introduction/staff/admin/controllers/staff.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

import { StaffRepositoryModule } from '@/modules/introduction/staff/staff.repository.module';

@Module({
  imports: [
    RbacModule,
    StaffRepositoryModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class AdminStaffModule { }

