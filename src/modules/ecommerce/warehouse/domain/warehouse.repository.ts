import { Warehouse } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const WAREHOUSE_REPOSITORY = 'IWarehouseRepository';

export interface WarehouseFilter {
    search?: string;
    code?: string;
    status?: 'active' | 'inactive';
    deleted_at?: Date | null;
    group_id?: number | bigint | null;
}

export interface IWarehouseRepository extends IRepository<Warehouse> {
    findByCode(code: string): Promise<Warehouse | null>;
}


