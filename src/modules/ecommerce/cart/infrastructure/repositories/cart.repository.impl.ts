import { Injectable } from '@nestjs/common';
import { CartHeader, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ICartRepository, CartFilter } from '../../domain/cart.repository';

@Injectable()
export class CartRepositoryImpl extends PrismaRepository<
    CartHeader,
    Prisma.CartHeaderWhereInput,
    Prisma.CartHeaderCreateInput,
    Prisma.CartHeaderUpdateInput,
    Prisma.CartHeaderOrderByWithRelationInput
> implements ICartRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.cartHeader as any);
        this.defaultSelect = {
            id: true,
            uuid: true,
            owner_key: true,
            user_id: true,
            currency: true,
            subtotal: true,
            total_amount: true,
            created_at: true,
            updated_at: true,
            items: {
                where: { deleted_at: null },
                include: {
                    product: { select: { name: true, image: true, sku: true } },
                    variant: { select: { name: true, image: true, sku: true, price: true } }
                }
            }
        };
    }

    protected buildWhere(filter: CartFilter): Prisma.CartHeaderWhereInput {
        const where: Prisma.CartHeaderWhereInput = {};

        if (filter.ownerKey) where.owner_key = filter.ownerKey;
        if (filter.userId) where.user_id = this.toPrimaryKey(filter.userId);
        if (filter.uuid) where.uuid = filter.uuid;

        return where;
    }

    async findByOwnerKey(ownerKey: string): Promise<CartHeader | null> {
        return this.findOne({ ownerKey });
    }

    async findByUserId(userId: number | bigint): Promise<CartHeader | null> {
        return this.findOne({ userId });
    }

    async findByUuid(uuid: string): Promise<CartHeader | null> {
        return this.findOne({ uuid });
    }
}


