import { Module } from '@nestjs/common';
import { PublicOrderController } from './controllers/order.controller';
import { PublicOrderService } from './services/order.service';
import { OrderAutomationService } from './services/order-automation.service';
import { OrderValidationService } from './services/order-validation.service';
import { OrderCalculationService } from './services/order-calculation.service';
import { OrderCreationService } from './services/order-creation.service';
import { OrderStockService } from './services/order-stock.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { AppMailModule } from '@/core/mail/mail.module';
import { PublicPaymentModule } from '@/modules/payment/public/payment.module';
import { OrderRepositoryModule } from '../order.repository.module';
import { CartRepositoryModule } from '../../cart/cart.repository.module';
import { ProductVariantRepositoryModule } from '../../product-variant/product-variant.repository.module';
import { ShippingMethodRepositoryModule } from '../../shipping-method/shipping-method.repository.module';

@Module({
  imports: [
    OrderRepositoryModule,
    CartRepositoryModule,
    ProductVariantRepositoryModule,
    ShippingMethodRepositoryModule,
    RbacModule,
    AppMailModule,
    PublicPaymentModule,
  ],
  controllers: [PublicOrderController],
  providers: [
    PublicOrderService,
    OrderAutomationService,
    OrderValidationService,
    OrderCalculationService,
    OrderCreationService,
    OrderStockService,
  ],
  exports: [PublicOrderService, OrderAutomationService],
})
export class PublicOrderModule { }