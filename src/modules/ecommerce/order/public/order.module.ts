import { Module } from '@nestjs/common';
import { PublicOrderController } from './controllers/order.controller';
import { OrderConstantsController } from './controllers/order-constants.controller';
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
import { WarehouseRepositoryModule } from '../../warehouse/warehouse.repository.module';
import { PaymentRepositoryModule } from '@/modules/payment/payment.repository.module';
import { ProductDigitalAssetRepositoryModule } from '../../product-digital-asset/product-digital-asset.repository.module';
import { EncryptionModule } from '@/common/encryption/encryption.module';
import { ContentTemplateModule } from '@/modules/core/content-template/content-template.module';

@Module({
  imports: [
    OrderRepositoryModule,
    CartRepositoryModule,
    ProductVariantRepositoryModule,
    ShippingMethodRepositoryModule,
    WarehouseRepositoryModule,
    PaymentRepositoryModule,
    ProductDigitalAssetRepositoryModule,
    EncryptionModule,
    ContentTemplateModule,
    RbacModule,
    AppMailModule,
    PublicPaymentModule,
  ],
  controllers: [PublicOrderController, OrderConstantsController],
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