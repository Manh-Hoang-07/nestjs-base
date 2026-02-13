import { Controller, Get, Query } from '@nestjs/common';
import { AdminCountryService } from '../services/country.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('admin/location/countries')
export class AdminCountryController {
    constructor(private readonly countryService: AdminCountryService) { }

    @Permission('admin.location.view')
    @Get()
    async getList(@Query() query: any) {
        return this.countryService.getList(query);
    }
}
