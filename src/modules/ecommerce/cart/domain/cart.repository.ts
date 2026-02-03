import { CartHeader } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const CART_REPOSITORY = 'ICartRepository';

export interface CartFilter {
    ownerKey?: string;
    userId?: number | bigint;
    uuid?: string;
    deleted_at?: Date | null;
}

export interface ICartRepository extends IRepository<CartHeader> {
    findByOwnerKey(ownerKey: string): Promise<CartHeader | null>;
    findByUserId(userId: number | bigint): Promise<CartHeader | null>;
    findByUuid(uuid: string): Promise<CartHeader | null>;
}


