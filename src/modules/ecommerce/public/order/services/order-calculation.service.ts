import { Injectable } from '@nestjs/common';
import { Cart } from '@/shared/entities/cart.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { OrderType } from '@/shared/enums/order-type.enum';

@Injectable()
export class OrderCalculationService {
  /**
   * Xác định order type dựa trên products trong cart
   */
  calculateOrderType(
    cartItems: Cart[],
    variantMap: Map<number, ProductVariant>,
  ): OrderType {
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
      return OrderType.MIXED;
    } else if (hasDigitalProducts) {
      return OrderType.DIGITAL;
    } else {
      return OrderType.PHYSICAL;
    }
  }
}
