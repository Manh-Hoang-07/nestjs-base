import { Injectable } from '@nestjs/common';
import { Cart, ProductVariant } from '@prisma/client';

@Injectable()
export class OrderCalculationService {
  /**
   * Xác định order type dựa trên products trong cart
   */
  calculateOrderType(
    cartItems: any[],
    variantMap: Map<number | bigint, any>,
  ): string {
    const hasPhysicalProducts = cartItems.some(item => {
      const variantId = item.product_variant_id;
      if (!variantId) return false;
      const variant = variantMap.get(variantId);
      return variant?.product?.is_digital === false;
    });

    const hasDigitalProducts = cartItems.some(item => {
      const variantId = item.product_variant_id;
      if (!variantId) return false;
      const variant = variantMap.get(variantId);
      return variant?.product?.is_digital === true;
    });

    if (hasPhysicalProducts && hasDigitalProducts) {
      return 'mixed';
    } else if (hasDigitalProducts) {
      return 'digital';
    } else {
      return 'physical';
    }
  }
}


