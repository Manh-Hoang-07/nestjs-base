import { Controller, Get, Query } from '@nestjs/common';
import { WardService } from '../services/ward.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('public/location/wards')
export class WardController {
    constructor(private readonly wardService: WardService) { }

    @Permission('public')
    @Get()
    async getList(@Query() query: any) {
        return this.wardService.getList(query);
    }
}
