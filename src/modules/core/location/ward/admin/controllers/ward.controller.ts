import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminWardService } from '../services/ward.service';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { CreateWardDto } from '../dtos/create-ward.dto';
import { UpdateWardDto } from '../dtos/update-ward.dto';

@Controller('admin/location/wards')
export class AdminWardController {
    constructor(private readonly wardService: AdminWardService) { }

    @Permission('ward.manage')
    @Get()
    async getList(@Query() query: any) {
        return this.wardService.getList(query);
    }

    @Permission('ward.manage')
    @Get('simple')
    async getSimpleList(@Query() query: any) {
        return this.wardService.getSimpleList(query);
    }

    @Permission('ward.manage')
    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.wardService.getOne(id);
    }

    @Permission('ward.manage')
    @LogRequest({ fileBaseName: 'location_ward_create' })
    @Post()
    async create(@Body() dto: CreateWardDto) {
        return this.wardService.create(dto);
    }

    @Permission('ward.manage')
    @LogRequest({ fileBaseName: 'location_ward_update' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateWardDto) {
        return this.wardService.update(id, dto);
    }

    @Permission('ward.manage')
    @LogRequest({ fileBaseName: 'location_ward_delete' })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.wardService.delete(id);
    }
}
