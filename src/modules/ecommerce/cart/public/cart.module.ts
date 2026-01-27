import { Module } from '@nestjs/common';
import { PublicCartController } from './controllers/cart.controller';
import { PublicCartService } from './services/cart.service';
import { CartValidationService } from './services/cart-validation.service';
import { CartItemService } from './services/cart-item.service';
import { CartCalculationService } from './services/cart-calculation.service';
import { CartManagementService } from './services/cart-management.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { CartRepositoryModule } from '../cart.repository.module';

@Module({
  imports: [
    CartRepositoryModule,
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