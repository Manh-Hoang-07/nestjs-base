import { Module } from '@nestjs/common';
import { CART_REPOSITORY } from './domain/cart.repository';
import { CartRepositoryImpl } from './infrastructure/repositories/cart.repository.impl';
import { PrismaModule } from '@/core/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: CART_REPOSITORY,
            useClass: CartRepositoryImpl,
        },
    ],
    exports: [CART_REPOSITORY],
})
export class CartRepositoryModule { }
