import { Module } from '@nestjs/common';

// Feature Modules
import { AdminProductModule } from './product/admin/product.module';
import { PublicProductModule } from './product/public/product.module';
import { AdminProductCategoryModule } from './product-category/admin/product-category.module';
import { PublicProductCategoryModule } from './product-category/public/product-category.module';
import { AdminOrderModule } from './order/admin/order.module';
import { PublicOrderModule } from './order/public/order.module';
import { AdminProductAttributeModule } from './product-attribute/admin/product-attribute.module';
import { AdminProductAttributeValueModule } from './product-attribute-value/admin/product-attribute-value.module';
import { AdminProductVariantModule } from './product-variant/admin/product-variant.module';
import { AdminWarehouseModule } from './warehouse/admin/warehouse.module';
import { AdminCouponModule } from './coupon/admin/coupon.module';
import { AdminShippingMethodModule } from './shipping-method/admin/shipping-method.module';
import { PublicCartModule } from './cart/public/cart.module';
import { PublicReviewModule } from './product-review/public/review.module';
import { TrackingModule } from './shipping/public/tracking.module';
import { PublicDiscountModule } from './discount/public/discount.module';
import { AdminProductDigitalAssetModule } from './product-digital-asset/admin/product-digital-asset.module';

@Module({
  imports: [
    // Product
    AdminProductModule,
    PublicProductModule,
    AdminProductDigitalAssetModule,

    // Category
    AdminProductCategoryModule,
    PublicProductCategoryModule,

    // Order
    AdminOrderModule,
    PublicOrderModule,

    // Attribute
    AdminProductAttributeModule,
    AdminProductAttributeValueModule,

    // Variant
    AdminProductVariantModule,

    // Warehouse
    AdminWarehouseModule,

    // Coupon
    AdminCouponModule,

    // Shipping
    AdminShippingMethodModule,
    TrackingModule,

    // Cart
    PublicCartModule,

    // Review
    PublicReviewModule,

    // Discount
    PublicDiscountModule,
  ],
  exports: [
    AdminProductModule,
    PublicProductModule,
    AdminProductDigitalAssetModule,
    AdminProductCategoryModule,
    PublicProductCategoryModule,
    AdminOrderModule,
    PublicOrderModule,
    AdminProductAttributeModule,
    AdminProductAttributeValueModule,
    AdminProductVariantModule,
    AdminWarehouseModule,
    AdminCouponModule,
    AdminShippingMethodModule,
    TrackingModule,
    PublicCartModule,
    PublicReviewModule,
    PublicDiscountModule,
  ],
})
export class EcommerceModule { }
