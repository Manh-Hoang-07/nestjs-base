import { ShippingMethod } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const SHIPPING_METHOD_REPOSITORY = 'IShippingMethodRepository';

export interface ShippingMethodFilter {
    search?: string;
    code?: string;
    status?: 'active' | 'inactive';
    deleted_at?: Date | null;
}

export interface IShippingMethodRepository extends IRepository<ShippingMethod> {
    findByCode(code: string): Promise<ShippingMethod | null>;
}


