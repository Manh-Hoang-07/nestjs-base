import { StockTransfer } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const STOCK_TRANSFER_REPOSITORY = 'STOCK_TRANSFER_REPOSITORY';

export interface IStockTransferRepository extends IRepository<StockTransfer> {
    // Add custom methods if needed
    findAllWithRelations(params: any): Promise<any>;
}
