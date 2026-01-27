import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicCartController } from '@/modules/ecommerce/public/cart/controllers/cart.controller';
import { PublicCartService } from '@/modules/ecommerce/public/cart/services/cart.service';
import { CartValidationService } from '@/modules/ecommerce/public/cart/services/cart-validation.service';
import { CartItemService } from '@/modules/ecommerce/public/cart/services/cart-item.service';
import { CartCalculationService } from '@/modules/ecommerce/public/cart/services/cart-calculation.service';
import { CartManagementService } from '@/modules/ecommerce/public/cart/services/cart-management.service';
import { Cart } from '@/shared/entities/cart.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartHeader,
      ProductVariant,
    ]),
    RbacModule,
  ],
  controllers: [PublicCartController],
  providers: [
    PublicCartService,
    CartValidationService,
    CartItemService,
    CartCalculationService,
    CartManagementService,
  ],
  exports: [PublicCartService],
})
export class PublicCartModule { }