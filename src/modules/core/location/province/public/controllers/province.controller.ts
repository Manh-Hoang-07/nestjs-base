import { Controller, Get, Query } from '@nestjs/common';
import { ProvinceService } from '../services/province.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('public/location/provinces')
export class ProvinceController {
    constructor(private readonly provinceService: ProvinceService) { }

    @Permission('public')
    @Get()
    async getList(@Query() query: any) {
        return this.provinceService.getList(query);
    }
}
