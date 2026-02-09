import { Module } from '@nestjs/common';
import { PublicMenuController } from './controllers/menu.controller';
import { AdminMenuModule } from '@/modules/core/menu/admin/menu.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
    imports: [
        RbacModule,
        AdminMenuModule,
    ],
    controllers: [PublicMenuController],
})
export class PublicMenuModule { }
