import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import all sub-modules
import { AdminProductCategoryModule } from '@/modules/ecommerce/admin/product-category/product-category.module';
import { AdminProductAttributeModule } from '@/modules/ecommerce/admin/product-attribute/product-attribute.module';
import { AdminProductAttributeValueModule } from '@/modules/ecommerce/admin/product-attribute-value/product-attribute-value.module';
import { AdminProductModule } from '@/modules/ecommerce/admin/product/product.module';
import { AdminProductVariantModule } from '@/modules/ecommerce/admin/product-variant/product-variant.module';
import { AdminShippingMethodModule } from '@/modules/ecommerce/admin/shipping-method/shipping-method.module';
import { AdminCouponModule } from '@/modules/ecommerce/admin/coupon/coupon.module';
import { AdminWarehouseModule } from '@/modules/ecommerce/admin/warehouse/warehouse.module';
import { PublicShippingMethodModule } from '@/modules/ecommerce/public/shipping-method/shipping-method.module';
import { PublicProductModule } from '@/modules/ecommerce/public/product/product.module';
import { PublicProductCategoryModule } from '@/modules/ecommerce/public/product-category/product-category.module';
import { PublicCartModule } from '@/modules/ecommerce/public/cart/cart.module';
import { PublicOrderModule } from '@/modules/ecommerce/public/order/order.module';
import { PaymentEcommerceModule } from '@/modules/payment/adapters/ecommerce/payment-ecommerce.module';
import { PublicDiscountModule } from '@/modules/ecommerce/public/discount/discount.module';
import { PublicReviewModule } from '@/modules/ecommerce/public/product-review/review.module';
import { TrackingModule } from '@/modules/ecommerce/public/shipping/tracking.module';
import { UserProductModule } from '@/modules/ecommerce/user/product/product.module';
import { UserProductCategoryModule } from '@/modules/ecommerce/user/product-category/product-category.module';
import { AdminOrderModule } from '@/modules/ecommerce/admin/order/order.module';
import { PaymentEcommerceAdminModule } from '@/modules/payment/adapters/ecommerce-admin/payment-ecommerce-admin.module';

// Import shared entities
import { Product } from '@/shared/entities/product.entity';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { ProductAttribute } from '@/shared/entities/product-attribute.entity';
import { ProductAttributeValue } from '@/shared/entities/product-attribute-value.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { ProductVariantAttribute } from '@/shared/entities/product-variant-attribute.entity';
import { ProductProductCategory } from '@/shared/entities/product-product-category.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { Cart } from '@/shared/entities/cart.entity';
import { Order } from '@/shared/entities/order.entity';
import { OrderItem } from '@/shared/entities/order-item.entity';
import { Payment } from '@/shared/entities/payment.entity';
import { ShippingMethod } from '@/shared/entities/shipping-method.entity';
import { Coupon } from '@/shared/entities/coupon.entity';
import { CouponUsage } from '@/shared/entities/coupon-usage.entity';
import { Promotion } from '@/shared/entities/promotion.entity';
import { TrackingHistory } from '@/shared/entities/tracking-history.entity';
import { Warehouse } from '@/shared/entities/warehouse.entity';
import { WarehouseInventory } from '@/shared/entities/warehouse-inventory.entity';
import { StockTransfer } from '@/shared/entities/stock-transfer.entity';
import { ProductReview } from '@/shared/entities/product-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductAttribute,
      ProductAttributeValue,
      ProductVariant,
      ProductVariantAttribute,
      ProductProductCategory,
      CartHeader,
      Cart,
      Order,
      OrderItem,
      Payment,
      ShippingMethod,
      Coupon,
      CouponUsage,
      Promotion,
      TrackingHistory,
      Warehouse,
      WarehouseInventory,
      StockTransfer,
      ProductReview,
    ]),
    // Admin modules
    AdminProductCategoryModule,
    AdminProductAttributeModule,
    AdminProductAttributeValueModule,
    AdminProductModule,
    AdminProductVariantModule,
    AdminShippingMethodModule,
    AdminCouponModule,
    AdminWarehouseModule,
    AdminOrderModule,
    PaymentEcommerceAdminModule,
    // Public modules
    PublicShippingMethodModule,
    PublicProductModule,
    PublicProductCategoryModule,
    PublicCartModule,
    PublicOrderModule,
    PaymentEcommerceModule,
    PublicDiscountModule,
    PublicReviewModule,
    TrackingModule,
    // User modules
    UserProductModule,
    UserProductCategoryModule,
  ],
  exports: [
    // Export shared entities for other modules to use
    TypeOrmModule,
  ],
})
export class EcommerceModule { }