# Enum System - Auto-Discovery Guide

## Cách thêm enum mới (HOÀN TOÀN TỰ ĐỘNG - KHÔNG CẦN ĐĂNG KÝ)

### Chỉ cần 2 bước:

### Bước 1: Tạo file enum trong `src/shared/enums/types/`

Tạo file mới với convention: `{name}.enum.ts`

**Ví dụ:** `src/shared/enums/types/order-status.enum.ts`

```typescript
import { OrderStatus } from '@prisma/client';

/**
 * Order Status Enum
 * Import từ Prisma
 */
export { OrderStatus };

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'Chờ xử lý',
  [OrderStatus.processing]: 'Đang xử lý',
  [OrderStatus.completed]: 'Hoàn thành',
  [OrderStatus.cancelled]: 'Đã hủy',
};
```

### Bước 2: Thêm export vào `types/index.ts`

Mở file `src/shared/enums/types/index.ts` và thêm 1 dòng:

```typescript
export * from './order-status.enum';
```

### Xong! 

Enum mới sẽ **TỰ ĐỘNG** được:
- ✅ Load vào registry
- ✅ Có sẵn trong `EnumService`
- ✅ Không cần sửa service hay registry!

## Convention

1. **Tên file**: `{name}.enum.ts` (snake-case)
   - Ví dụ: `order-status.enum.ts`, `payment-method.enum.ts`

2. **Exports bắt buộc**:
   - `{EnumName}` - Enum object từ Prisma
   - `{EnumName}Labels` - Record với labels

3. **Registry key**: snake_case
   - File `order-status.enum.ts` → key: `order_status`
   - File `payment-method.enum.ts` → key: `payment_method`

4. **Enum name**: PascalCase
   - File `order-status.enum.ts` → name: `OrderStatus`

## Ví dụ hoàn chỉnh

### File: `src/shared/enums/types/payment-method.enum.ts`
```typescript
import { PaymentMethod } from '@prisma/client';

export { PaymentMethod };

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: 'Tiền mặt',
  [PaymentMethod.card]: 'Thẻ',
  [PaymentMethod.bank_transfer]: 'Chuyển khoản',
};
```

### Thêm vào `enum-registry.ts`:
```typescript
import { PaymentMethod, PaymentMethodLabels } from '../types/payment-method.enum';

export const ENUM_REGISTRY: Record<string, EnumRegistryItem> = {
  // ... existing
  payment_method: {
    name: 'PaymentMethod',
    key: 'payment_method',
    enum: PaymentMethod,
    labels: PaymentMethodLabels,
  },
};
```

## Lưu ý

- Enum phải có trong Prisma schema trước
- Labels phải cover tất cả values của enum
- Key trong registry phải là snake_case và unique

