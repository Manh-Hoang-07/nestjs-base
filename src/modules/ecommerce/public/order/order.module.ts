import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicOrderController } from '@/modules/ecommerce/public/order/controllers/order.controller';
import { PublicOrderService } from '@/modules/ecommerce/public/order/services/order.service';
import { OrderAutomationService } from '@/modules/ecommerce/public/order/services/order-automation.service';
import { OrderValidationService } from '@/modules/ecommerce/public/order/services/order-validation.service';
import { OrderCalculationService } from '@/modules/ecommerce/public/order/services/order-calculation.service';
import { OrderCreationService } from '@/modules/ecommerce/public/order/services/order-creation.service';
import { OrderStockService } from '@/modules/ecommerce/public/order/services/order-stock.service';
import { Order } from '@/shared/entities/order.entity';
import { OrderItem } from '@/shared/entities/order-item.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { Cart } from '@/shared/entities/cart.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { Payment } from '@/shared/entities/payment.entity';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { ShippingMethod } from '@/shared/entities/shipping-method.entity';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { AppMailModule } from '@/core/mail/mail.module';
import { PaymentCoreModule } from '@/modules/payment/core/payment-core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      CartHeader,
      Cart,
      ProductVariant,
      Payment,
      PaymentMethod,
      ShippingMethod,
    ]),
    RbacModule,
    AppMailModule,
    PaymentCoreModule,
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