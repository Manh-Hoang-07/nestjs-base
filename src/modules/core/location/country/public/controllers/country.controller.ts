import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { CountryService } from '../services/country.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('public/location/countries')
export class CountryController {
    constructor(private readonly countryService: CountryService) { }

    @Permission('public')
    @Get()
    async getList(@Query() query: any) {
        return this.countryService.getList(query);
    }
}
