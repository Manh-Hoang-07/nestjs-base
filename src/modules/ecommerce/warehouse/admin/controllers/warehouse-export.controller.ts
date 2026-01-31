import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
    ValidationPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/auth/guards/rbac.guard';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { AdminWarehouseService } from '../services/warehouse.service';
import { CreateExportDto } from '../dtos/create-export.dto';
import { prepareQuery } from '@/common/core/utils/list-query.helper';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/warehouse-exports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminWarehouseExportController {
    constructor(private readonly warehouseService: AdminWarehouseService) { }

    @Get()
    @Permission('warehouse_export.manage')
    async getList(@Query(ValidationPipe) query: any) {
        const { filter, options } = prepareQuery(query);
        return this.warehouseService.getStockTransfers({
            ...filter,
            ...options,
            type: 'export'
        });
    }

    @Get(':id')
    @Permission('warehouse_export.manage')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        const result = await this.warehouseService.getStockTransfers({
            id: id,
            type: 'export'
        });
        return result.data && result.data.length > 0 ? result.data[0] : null;
    }

    @LogRequest()
    @Post()
    @Permission('warehouse_export.manage')
    async create(
        @Request() req: any,
        @Body(ValidationPipe) dto: CreateExportDto,
    ) {
        const results = [];
        for (const item of dto.items) {
            const res = await this.warehouseService.createExport(
                dto.warehouse_id,
                [item],
                req.user?.id,
                dto.reason
            );
            results.push(res);
        }
        return { success: true, count: results.length, first_id: results[0]?.id };
    }

    @LogRequest()
    @Post(':id/approve')
    @Permission('warehouse_export.manage')
    async approve(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any,
    ) {
        return this.warehouseService.approveExport(id, req.user?.id);
    }

    @LogRequest()
    @Post(':id/cancel')
    @Permission('warehouse_export.manage')
    async cancel(@Param('id', ParseIntPipe) id: number) {
        return this.warehouseService.cancelStockTransfer(id);
    }
}
