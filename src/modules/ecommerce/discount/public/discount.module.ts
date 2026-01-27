import { Module, forwardRef } from '@nestjs/common';
import { PublicDiscountController } from './controllers/discount.controller';
import { DiscountService } from './services/discount.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { PublicCartModule } from '../../cart/public/cart.module';
import { DiscountRepositoryModule } from '../discount.repository.module';

@Module({
  imports: [
    DiscountRepositoryModule,
    RbacModule,
    forwardRef(() => PublicCartModule),
  ],
  controllers: [PublicDiscountController],
  providers: [DiscountService],
  exports: [DiscountService],
})
export class PublicDiscountModule { }