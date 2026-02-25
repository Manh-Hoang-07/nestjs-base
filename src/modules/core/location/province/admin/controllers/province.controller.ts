import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminProvinceService } from '../services/province.service';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { CreateProvinceDto } from '../dtos/create-province.dto';
import { UpdateProvinceDto } from '../dtos/update-province.dto';

@Controller('admin/location/provinces')
export class AdminProvinceController {
    constructor(private readonly provinceService: AdminProvinceService) { }

    @Permission('province.manage')
    @Get()
    async getList(@Query() query: any) {
        return this.provinceService.getList(query);
    }

    @Permission('province.manage')
    @Get('simple')
    async getSimpleList(@Query() query: any) {
        return this.provinceService.getSimpleList(query);
    }

    @Permission('province.manage')
    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.provinceService.getOne(id);
    }

    @Permission('province.manage')
    @LogRequest({ fileBaseName: 'location_province_create' })
    @Post()
    async create(@Body() dto: CreateProvinceDto) {
        return this.provinceService.create(dto);
    }

    @Permission('province.manage')
    @LogRequest({ fileBaseName: 'location_province_update' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateProvinceDto) {
        return this.provinceService.update(id, dto);
    }

    @Permission('province.manage')
    @LogRequest({ fileBaseName: 'location_province_delete' })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.provinceService.delete(id);
    }
}
