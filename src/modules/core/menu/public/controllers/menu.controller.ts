import { Controller, Get, Query } from '@nestjs/common';
import { Permission } from '@/common/auth/decorators';
import { AuthService } from '@/common/auth/services';
import { MenuService } from '@/modules/core/menu/admin/services/menu.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Controller('public/menus')
export class PublicMenuController {
    constructor(
        private readonly service: MenuService,
        private readonly auth: AuthService,
    ) { }

    @Permission('public')
    @Get()
    async getPublicMenus() {
        const userId = this.auth.id();

        return this.service.getUserMenus(userId ?? undefined, {
            group: 'client',
        });
    }
}
