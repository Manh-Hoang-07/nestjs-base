import { Controller, Get, Query } from '@nestjs/common';
import { AdminWardService } from '../services/ward.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('admin/location/wards')
export class AdminWardController {
    constructor(private readonly wardService: AdminWardService) { }

    @Permission('admin.location.view')
    @Get()
    async getList(@Query() query: any) {
        return this.wardService.getList(query);
    }
}
