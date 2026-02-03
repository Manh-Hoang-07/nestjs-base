import { Module } from '@nestjs/common';
import { CART_REPOSITORY } from './domain/cart.repository';
import { CartRepositoryImpl } from './infrastructure/repositories/cart.repository.impl';
import { CART_ITEM_REPOSITORY } from './domain/cart-item.repository';
import { CartItemRepositoryImpl } from './infrastructure/repositories/cart-item.repository.impl';
import { PrismaModule } from '@/core/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: CART_REPOSITORY,
            useClass: CartRepositoryImpl,
        },
        {
            provide: CART_ITEM_REPOSITORY,
            useClass: CartItemRepositoryImpl,
        },
    ],
    exports: [CART_REPOSITORY, CART_ITEM_REPOSITORY],
})
export class CartRepositoryModule { }
