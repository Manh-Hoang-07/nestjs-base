import { Cart } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const CART_ITEM_REPOSITORY = 'ICartItemRepository';

export interface CartItemFilter {
    cart_header_id?: number | bigint;
    product_variant_id?: number | bigint;
}

export interface ICartItemRepository extends IRepository<Cart> {
}


