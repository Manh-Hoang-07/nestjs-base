import { Injectable } from '@nestjs/common';
import { Cart, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ICartItemRepository, CartItemFilter } from '../../domain/cart-item.repository';

@Injectable()
export class CartItemRepositoryImpl extends PrismaRepository<
    Cart,
    Prisma.CartWhereInput,
    Prisma.CartCreateInput,
    Prisma.CartUpdateInput,
    Prisma.CartOrderByWithRelationInput
> implements ICartItemRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.cart as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: CartItemFilter): Prisma.CartWhereInput {
        const where: Prisma.CartWhereInput = {};
        if (filter.cart_header_id) where.cart_header_id = this.toPrimaryKey(filter.cart_header_id);
        if (filter.product_variant_id) where.product_variant_id = this.toPrimaryKey(filter.product_variant_id);
        return where;
    }
}
