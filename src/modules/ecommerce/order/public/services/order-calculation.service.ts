import { Injectable } from '@nestjs/common';

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

  /**
   * Tính toán các đầu số cuối cùng cho Order
   */
  calculateOrderTotals(
    cartHeader: any,
    shippingMethod: any,
    orderType: string,
  ) {
    const subtotal = Number(cartHeader.subtotal) || 0;
    const taxAmount = Number(cartHeader.tax_amount) || 0;
    const discountAmount = Number(cartHeader.discount_amount) || 0;

    // Logic: Nếu là đơn Digital toàn bộ thì phí ship = 0 bất chấp FE gửi gì
    let shippingAmount = 0;
    if (orderType !== 'digital' && shippingMethod) {
      shippingAmount = Number(shippingMethod.price) || 0;
    }

    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      totalAmount,
    };
  }
}
