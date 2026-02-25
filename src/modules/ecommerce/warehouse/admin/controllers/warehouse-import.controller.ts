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
import { CreateImportDto } from '../dtos/create-import.dto';
import { prepareQuery } from '@/common/core/utils/list-query.helper';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/warehouse-imports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminWarehouseImportController {
    constructor(private readonly warehouseService: AdminWarehouseService) { }

    @Get()
    @Permission('warehouse_import.manage')
    async getList(@Query(ValidationPipe) query: any) {
        const { filter, options } = prepareQuery(query);
        return this.warehouseService.getStockTransfers({
            ...filter,
            ...options,
            type: 'import'
        });
    }

    @Get('simple')
    @Permission('warehouse_import.manage')
    async getSimpleList(@Query(ValidationPipe) query: any) {
        const { filter, options } = prepareQuery(query);
        return this.warehouseService.getSimpleStockTransfers({
            ...filter,
            ...options,
            type: 'import'
        });
    }

    @Get(':id')
    @Permission('warehouse_import.manage')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        // Reuse getStockTransfer detail logic or implementation generic one
        // For now, assume generic list/detail via repo
        // But we probably need a service method for specific detail including items
        // Let's use getStockTransfers with ID filter for now or add getById to service
        // Actually stockTransferRepository has findById.
        // We'll use a service method to wrap it safely.
        // Since we don't have getStockTransferById exposed in service, let's use list with ID or just assume repo access via service wrapper?
        // Service should expose it.
        // Let's assume generic getStockTransfers returns list.
        // To keep it simple, I'll filter by ID in the list method for now if needed, or better ADD getStockTransferById to service.
        // Checking service... it doesn't have public getById for transfer.
        // I will use `getStockTransfers` filtering by ID for MVP or direct repo access? No, stick to service.
        const result = await this.warehouseService.getStockTransfers({
            id: id,
            type: 'import'
        });
        return result.data && result.data.length > 0 ? result.data[0] : null;
    }

    @LogRequest()
    @Post()
    @Permission('warehouse_import.manage')
    async create(
        @Request() req: any,
        @Body(ValidationPipe) dto: CreateImportDto,
    ) {
        // Supports single item creation via service for now as per previous service update
        // Controller will loop if multiple items are actually required to be separate records.
        // But "Import Note" usually contains multiple items.
        // The service `createImport` I wrote takes `items: any[]` but only uses `items[0]`.
        // This suggests we need to upgrade service or loop here.
        // If we want 1 Import Note = 1 Record, then StockTransfer Table structure (1 product per row) is limiting.
        // Usually 1 Import Note = Many StockTransfer Records (Lines).
        // Let's loop here and create multiple records.

        const results = [];
        for (const item of dto.items) {
            const res = await this.warehouseService.createImport(
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
    @Permission('warehouse_import.manage')
    async approve(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any,
    ) {
        return this.warehouseService.approveImport(id, req.user?.id);
    }

    @LogRequest()
    @Post(':id/cancel')
    @Permission('warehouse_import.manage')
    async cancel(@Param('id', ParseIntPipe) id: number) {
        return this.warehouseService.cancelStockTransfer(id);
    }
}
