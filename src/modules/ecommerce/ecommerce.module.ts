import { Module } from '@nestjs/common';

// Feature Modules
import { AdminProductModule } from './product/admin/product.module';
import { PublicProductModule } from './product/public/product.module';
import { AdminProductCategoryModule } from './product-category/admin/product-category.module';
import { PublicProductCategoryModule } from './product-category/public/product-category.module';
import { AdminOrderModule } from './order/admin/order.module';
import { PublicOrderModule } from './order/public/order.module';
// ... other modules would be imported here as they are refactored

@Module({
  imports: [
    // Product
    AdminProductModule,
    PublicProductModule,

    // Category
    AdminProductCategoryModule,
    PublicProductCategoryModule,

    // Order
    AdminOrderModule,
    PublicOrderModule,

    // Payment bridge (existing in project)
    // PaymentEcommerceAdminModule,
    // PaymentEcommerceModule,
  ],
  exports: [
    AdminProductModule,
    PublicProductModule,
    AdminProductCategoryModule,
    PublicProductCategoryModule,
    AdminOrderModule,
    PublicOrderModule,
  ],
})
export class EcommerceModule { }