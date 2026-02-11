import { Controller, Post, Body, Delete, Param, UseGuards, Get, Query, Put } from '@nestjs/common';
import { AdminProductDigitalAssetService } from '../services/admin-product-digital-asset.service';
import { BulkImportAssetDto } from '../dtos/bulk-import-asset.dto';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/auth/guards/rbac.guard';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('admin/ecommerce/product-digital-assets')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductDigitalAssetController {
    constructor(private readonly adminService: AdminProductDigitalAssetService) { }

    @Get()
    @Permission('product.manage')
    async findAll(@Query() query: any) {
        return this.adminService.getList(query);
    }

    @Get(':id')
    @Permission('product.manage')
    async findOne(@Param('id') id: string) {
        return this.adminService.getOne(Number(id));
    }

    @Post()
    @Permission('product.manage')
    async create(@Body() dto: any) {
        return this.adminService.create(dto);
    }

    @Put(':id')
    @Permission('product.manage')
    async update(@Param('id') id: string, @Body() dto: any) {
        return this.adminService.update(Number(id), dto);
    }

    @Post('bulk-import')
    @Permission('product.manage')
    async bulkImport(@Body() dto: BulkImportAssetDto) {
        return this.adminService.bulkImport(dto);
    }

    @Delete(':id')
    @Permission('product.manage')
    async delete(@Param('id') id: string) {
        return this.adminService.delete(Number(id));
    }
}
