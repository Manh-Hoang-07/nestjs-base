import { Controller, Get, Query } from '@nestjs/common';
import { AdminProvinceService } from '../services/province.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('admin/location/provinces')
export class AdminProvinceController {
    constructor(private readonly provinceService: AdminProvinceService) { }

    @Permission('admin.location.view')
    @Get()
    async getList(@Query() query: any) {
        return this.provinceService.getList(query);
    }
}
