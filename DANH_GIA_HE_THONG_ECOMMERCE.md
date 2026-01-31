# ĐÁNH GIÁ HỆ THỐNG ECOMMERCE - MÔ HÌNH MULTI-SHOP

**Ngày đánh giá:** 31/01/2026  
**Người đánh giá:** AI Assistant  
**Phiên bản hệ thống:** Current (NestJS + Prisma)

---

## 📋 TÓM TẮT ĐÁNH GIÁ

### ✅ **KẾT LUẬN CHUNG**
Hệ thống **ĐÃ SẴN SÀNG** cho mô hình multi-shop với cơ chế phân quyền theo `group_id`. Tuy nhiên, cần **BỔ SUNG VÀ HOÀN THIỆN** một số điểm quan trọng để đảm bảo tính toàn vẹn dữ liệu và tránh lẫn lộn quản lý giữa các shop.

### 🎯 **ĐIỂM MẠNH**
- ✅ Hệ thống phân quyền RBAC hoàn chỉnh với Context, Group, Role, Permission
- ✅ Đã có `group_id` trong các bảng quan trọng: Product, Order, Coupon, Post
- ✅ Service layer đã implement logic filter theo `group_id` tự động
- ✅ Có cơ chế `verifyGroupOwnership()` để kiểm tra quyền sở hữu
- ✅ Warehouse system độc lập, có thể chia sẻ hoặc riêng biệt giữa các shop

### ⚠️ **VẤN ĐỀ CẦN KHẮC PHỤC**
- ❌ **Thiếu `group_id`** trong một số bảng quan trọng
- ❌ **Chưa có ràng buộc database** để đảm bảo tính toàn vẹn dữ liệu
- ❌ **Thiếu middleware/guard** kiểm tra quyền truy cập toàn cục
- ❌ **Chưa có cơ chế chia sẻ kho** giữa các shop một cách rõ ràng
- ❌ **Thiếu documentation** về multi-tenancy architecture

---

## 🔍 PHÂN TÍCH CHI TIẾT

### 1. KIẾN TRÚC PHÂN QUYỀN

#### 1.1. Mô hình phân quyền hiện tại

```
Context (Ngữ cảnh - VD: Shop A, Shop B)
    ↓
Group (Nhóm trong Context - VD: Admin Shop A, Staff Shop A)
    ↓
User ←→ UserGroup ←→ Group
    ↓
UserRoleAssignment (User + Role + Group)
    ↓
Role ←→ Permission
```

**Đánh giá:** ✅ **XUẤT SẮC**
- Mô hình RBAC đầy đủ và linh hoạt
- Hỗ trợ multi-context (multi-shop) từ thiết kế
- User có thể tham gia nhiều group, có nhiều role khác nhau trong mỗi group

#### 1.2. Cơ chế phân quyền theo group_id

**Schema hiện tại:**

| Bảng | Có group_id? | Ghi chú |
|------|-------------|---------|
| `products` | ✅ | Line 1056 - Đã có |
| `orders` | ✅ | Line 1500 - Đã có |
| `coupons` | ✅ | Line 1264 - Đã có |
| `posts` | ✅ | Line 558 - Đã có |
| `product_categories` | ✅ | **ĐÃ BỔ SUNG** - NULL = global, có giá trị = riêng group |
| `product_variants` | ✅ | **ĐÃ BỔ SUNG** - Inherit từ product |
| `warehouses` | ✅ | **ĐÃ BỔ SUNG** - NULL = shared, có giá trị = riêng group |
| `warehouse_inventory` | ✅ | **ĐÃ BỔ SUNG** - Inherit từ warehouse/product |
| `stock_transfers` | ✅ | **ĐÃ BỔ SUNG** - Inherit từ warehouse/product |
| `product_reviews` | ✅ | **ĐÃ BỔ SUNG** - Inherit từ product |
| `payment_methods` | ➖ | **KHÔNG CẦN** - Dùng chung toàn hệ thống |
| `shipping_methods` | ➖ | **KHÔNG CẦN** - Dùng chung toàn hệ thống |
| `banners` | ➖ | **KHÔNG CẦN** - Dùng chung toàn hệ thống |

**Đánh giá:** ✅ **ĐÃ HOÀN THIỆN**

---

### 2. PHÂN TÍCH CÁC MODULE ECOMMERCE

#### 2.1. Module Product (Sản phẩm)

**Trạng thái:** ✅ **TỐT** - Đã có `group_id`

**Logic phân quyền:**
```typescript
// File: src/modules/ecommerce/product/admin/services/product.service.ts

// 1. Tự động filter theo group khi list
protected override async prepareFilters(filters?: any): Promise<any> {
  const prepared = { ...(filters || {}) };
  if (prepared.group_id === undefined) {
    const contextId = RequestContext.get<number>('contextId');
    const groupId = RequestContext.get<number | null>('groupId');
    if (contextId && contextId !== 1 && groupId) {
      prepared.group_id = groupId; // ✅ Tự động filter
    }
  }
  return prepared;
}

// 2. Tự động gán group_id khi tạo
protected override async beforeCreate(data: CreateProductDto): Promise<any> {
  const groupId = RequestContext.get<number | null>('groupId');
  if (groupId) {
    (payload as any).group_id = groupId; // ✅ Tự động gán
  }
  return payload;
}

// 3. Verify ownership khi update/delete
protected override async beforeUpdate(id, data): Promise<any> {
  const entity = await this.repository.findById(id);
  verifyGroupOwnership(entity); // ✅ Kiểm tra quyền sở hữu
  return payload;
}
```

**Vấn đề:**
- ❌ `ProductCategory` không có `group_id` → Shop A có thể thấy category của Shop B
- ❌ `ProductVariant` không có `group_id` → Có thể truy cập variant của shop khác
- ❌ Thiếu index cho `group_id` → Performance kém khi có nhiều shop

**Khuyến nghị:**
```sql
-- Bổ sung group_id cho ProductCategory
ALTER TABLE product_categories ADD COLUMN group_id BIGINT UNSIGNED;
ALTER TABLE product_categories ADD INDEX idx_product_categories_group_id (group_id);

-- Bổ sung group_id cho ProductVariant
ALTER TABLE product_variants ADD COLUMN group_id BIGINT UNSIGNED;
ALTER TABLE product_variants ADD INDEX idx_product_variants_group_id (group_id);
```

---

#### 2.2. Module Order (Đơn hàng)

**Trạng thái:** ✅ **TỐT** - Đã có `group_id`

**Logic phân quyền:**
```typescript
// File: src/modules/ecommerce/order/admin/services/order.service.ts

// Tự động filter theo group
protected override async prepareFilters(filters?: any): Promise<any> {
  const prepared = { ...(filters || {}) };
  if (prepared.group_id === undefined) {
    const contextId = RequestContext.get<number>('contextId');
    const groupId = RequestContext.get<number | null>('groupId');
    if (contextId && contextId !== 1 && groupId) {
      prepared.group_id = groupId; // ✅ Tự động filter
    }
  }
  return prepared;
}

// Verify ownership
override async getOne(id): Promise<Order> {
  const order = await super.getOne(id);
  verifyGroupOwnership(order); // ✅ Kiểm tra quyền sở hữu
  return order;
}
```

**Vấn đề:**
- ❌ `OrderItem` không có `group_id` → Có thể query order item của shop khác
- ❌ Khi tạo order từ public API, cần logic gán `group_id` dựa trên product

**Khuyến nghị:**
```typescript
// Trong OrderCreationService, khi tạo order từ cart:
async createOrderFromCart(cartId: string): Promise<Order> {
  const cart = await this.getCart(cartId);
  const firstProduct = await this.productRepo.findById(cart.items[0].product_id);
  
  const orderData = {
    ...cartData,
    group_id: firstProduct.group_id // ✅ Lấy group_id từ product
  };
  
  return this.orderRepo.create(orderData);
}
```

---

#### 2.3. Module Warehouse (Kho hàng)

**Trạng thái:** ⚠️ **CẦN CẢI THIỆN** - Chưa có `group_id`

**Vấn đề nghiêm trọng:**
1. ❌ `Warehouse` không có `group_id` → Không phân biệt kho của shop nào
2. ❌ `WarehouseInventory` không có `group_id` → Shop A có thể thấy tồn kho của Shop B
3. ❌ `StockTransfer` không có `group_id` → Có thể chuyển kho giữa các shop khác nhau

**Kịch bản lỗi:**
```
Shop A tạo kho "Kho Hà Nội"
Shop B tạo kho "Kho Hà Nội"
→ Hệ thống không phân biệt được 2 kho này thuộc shop nào
→ Shop A có thể xem/chỉnh sửa kho của Shop B
```

**Khuyến nghị khẩn cấp:**
```sql
-- Bổ sung group_id cho Warehouse
ALTER TABLE warehouses ADD COLUMN group_id BIGINT UNSIGNED;
ALTER TABLE warehouses ADD INDEX idx_warehouses_group_id (group_id);

-- Bổ sung group_id cho WarehouseInventory
ALTER TABLE warehouse_inventory ADD COLUMN group_id BIGINT UNSIGNED;
ALTER TABLE warehouse_inventory ADD INDEX idx_wi_group_id (group_id);

-- Bổ sung group_id cho StockTransfer
ALTER TABLE stock_transfers ADD COLUMN group_id BIGINT UNSIGNED;
ALTER TABLE stock_transfers ADD INDEX idx_st_group_id (group_id);
```

**Cơ chế chia sẻ kho (nếu cần):**
```typescript
// Option 1: Warehouse có thể thuộc nhiều group (shared warehouse)
model WarehouseGroup {
  warehouse_id BigInt
  group_id     BigInt
  
  @@id([warehouse_id, group_id])
}

// Option 2: Warehouse có owner_group_id và shared_with_groups
model Warehouse {
  owner_group_id BigInt  // Shop sở hữu
  is_shared      Boolean @default(false)
  shared_groups  Json?   // [1, 2, 3] - Các group được chia sẻ
}
```

---

#### 2.4. Module Coupon (Mã khuyến mãi)

**Trạng thái:** ✅ **TỐT** - Đã có `group_id`

**Logic phân quyền:**
```typescript
// File: src/modules/ecommerce/coupon/admin/services/coupon.service.ts

protected override async beforeCreate(data): Promise<any> {
  const groupId = RequestContext.get<number | null>('groupId');
  if (groupId) {
    prepared.group_id = groupId; // ✅ Tự động gán
  }
  return prepared;
}
```

**Vấn đề:**
- ⚠️ Khi user apply coupon từ public API, cần kiểm tra coupon có thuộc shop của product không

**Khuyến nghị:**
```typescript
async applyCoupon(code: string, cartId: string): Promise<void> {
  const cart = await this.getCart(cartId);
  const coupon = await this.couponRepo.findByCode(code);
  
  // ✅ Kiểm tra coupon có cùng group với product trong cart
  const firstProduct = await this.productRepo.findById(cart.items[0].product_id);
  if (coupon.group_id !== firstProduct.group_id) {
    throw new BadRequestException('Coupon không áp dụng cho shop này');
  }
}
```

---

#### 2.5. Module Payment & Shipping

**Trạng thái:** ❌ **THIẾU** - Chưa có `group_id`

**Vấn đề:**
1. `PaymentMethod` không có `group_id` → Shop A có thể dùng payment method của Shop B
2. `ShippingMethod` không có `group_id` → Shop A có thể dùng shipping method của Shop B

**Kịch bản lỗi:**
```
Shop A cấu hình VNPay với merchant_id riêng
Shop B cũng cấu hình VNPay với merchant_id riêng
→ Nếu không có group_id, có thể xảy ra nhầm lẫn khi thanh toán
```

**Khuyến nghị:**
```sql
-- Bổ sung group_id
ALTER TABLE payment_methods ADD COLUMN group_id BIGINT UNSIGNED;
ALTER TABLE payment_methods ADD INDEX idx_payment_methods_group_id (group_id);

ALTER TABLE shipping_methods ADD COLUMN group_id BIGINT UNSIGNED;
ALTER TABLE shipping_methods ADD INDEX idx_shipping_methods_group_id (group_id);
```

---

### 3. ĐÁNH GIÁ BẢO MẬT VÀ TÍNH TOÀN VẸN DỮ LIỆU

#### 3.1. Cơ chế kiểm tra quyền sở hữu

**Hiện tại:**
```typescript
// File: src/common/shared/utils/group-ownership.util.ts
export function verifyGroupOwnership(entity: any): void {
  const groupId = RequestContext.get<number | null>('groupId');
  const contextId = RequestContext.get<number>('contextId');
  
  if (contextId && contextId !== 1 && groupId) {
    if (entity.group_id && Number(entity.group_id) !== groupId) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }
  }
}
```

**Đánh giá:** ✅ **TỐT** nhưng cần bổ sung:
- ⚠️ Chỉ kiểm tra khi `contextId !== 1` (System context được bypass)
- ⚠️ Không kiểm tra nếu entity không có `group_id`
- ⚠️ Cần áp dụng cho tất cả các module

**Khuyến nghị:**
```typescript
// Tạo Guard toàn cục
@Injectable()
export class GroupOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const groupId = RequestContext.get<number>('groupId');
    
    // ✅ Kiểm tra mọi request đều phải có groupId (trừ system admin)
    if (!user.isSystemAdmin && !groupId) {
      throw new ForbiddenException('Không xác định được shop');
    }
    
    return true;
  }
}

// Áp dụng global
app.useGlobalGuards(new GroupOwnershipGuard());
```

---

#### 3.2. Ràng buộc Database

**Hiện tại:** ❌ **THIẾU HOÀN TOÀN**

**Vấn đề:**
- Không có foreign key constraint cho `group_id`
- Không có check constraint để đảm bảo dữ liệu liên quan cùng group

**Khuyến nghị:**
```sql
-- Thêm foreign key cho group_id
ALTER TABLE products 
  ADD CONSTRAINT fk_products_group 
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT;

ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_group 
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT;

-- Thêm check constraint: Order và Product phải cùng group
ALTER TABLE order_items 
  ADD CONSTRAINT chk_order_product_same_group 
  CHECK (
    (SELECT group_id FROM orders WHERE id = order_id) = 
    (SELECT group_id FROM products WHERE id = product_id)
  );

-- Thêm check constraint: Coupon và Product phải cùng group
-- (Implement ở application layer vì MySQL không hỗ trợ subquery trong CHECK)
```

---

### 4. KỊCH BẢN SỬ DỤNG MULTI-SHOP

#### 4.1. Kịch bản 1: Tạo Shop mới

**Luồng hiện tại:**
```
1. System Admin tạo Context mới (Shop A)
2. System Admin tạo Group trong Context (Admin Shop A, Staff Shop A)
3. System Admin tạo User và gán vào Group
4. System Admin gán Role cho User trong Group
```

**Đánh giá:** ✅ **ỔN** - Luồng rõ ràng

**Khuyến nghị bổ sung:**
```typescript
// Tạo service tự động setup shop
async createNewShop(data: CreateShopDto): Promise<Shop> {
  return this.prisma.$transaction(async (tx) => {
    // 1. Tạo Context
    const context = await tx.context.create({
      data: { type: 'shop', name: data.shopName, code: data.shopCode }
    });
    
    // 2. Tạo Group Admin
    const adminGroup = await tx.group.create({
      data: { 
        type: 'shop_admin', 
        code: `${data.shopCode}_admin`,
        name: `Admin ${data.shopName}`,
        context_id: context.id
      }
    });
    
    // 3. Tạo User admin đầu tiên
    const adminUser = await tx.user.create({
      data: { ...data.adminUser }
    });
    
    // 4. Gán User vào Group
    await tx.userGroup.create({
      data: { user_id: adminUser.id, group_id: adminGroup.id }
    });
    
    // 5. Gán Role admin
    await tx.userRoleAssignment.create({
      data: { 
        user_id: adminUser.id, 
        role_id: SHOP_ADMIN_ROLE_ID,
        group_id: adminGroup.id
      }
    });
    
    // 6. Tạo warehouse mặc định
    await tx.warehouse.create({
      data: {
        name: `Kho ${data.shopName}`,
        code: `${data.shopCode}_main`,
        group_id: adminGroup.id // ✅ Gán group_id
      }
    });
    
    return { context, adminGroup, adminUser };
  });
}
```

---

#### 4.2. Kịch bản 2: Shop A bán hàng

**Luồng:**
```
1. User Shop A login → RequestContext set groupId = Shop A Group ID
2. User tạo Product → Tự động gán group_id = Shop A
3. Customer đặt hàng → Order tự động gán group_id từ Product
4. Shop A xem đơn hàng → Chỉ thấy đơn có group_id = Shop A
```

**Vấn đề hiện tại:**
- ⚠️ Bước 3: Chưa có logic tự động gán `group_id` cho Order từ Product
- ⚠️ Nếu cart có product từ nhiều shop → Cần tách thành nhiều order

**Khuyến nghị:**
```typescript
async createOrderFromCart(cartId: string): Promise<Order[]> {
  const cart = await this.getCartWithItems(cartId);
  
  // ✅ Group items theo shop (group_id)
  const itemsByShop = cart.items.reduce((acc, item) => {
    const groupId = item.product.group_id;
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(item);
    return acc;
  }, {});
  
  // ✅ Tạo 1 order cho mỗi shop
  const orders = [];
  for (const [groupId, items] of Object.entries(itemsByShop)) {
    const order = await this.orderRepo.create({
      ...orderData,
      group_id: groupId, // ✅ Gán group_id
      items: items
    });
    orders.push(order);
  }
  
  return orders;
}
```

---

#### 4.3. Kịch bản 3: Chia sẻ Warehouse

**Tình huống:** Shop A và Shop B cùng dùng 1 kho chung

**Giải pháp 1: Warehouse thuộc về 1 shop, chia sẻ cho shop khác**
```typescript
model Warehouse {
  owner_group_id BigInt
  is_shared      Boolean @default(false)
  shared_groups  Json?   // [group_id_1, group_id_2]
}

// Service check quyền truy cập
canAccessWarehouse(warehouseId: bigint, groupId: number): boolean {
  const warehouse = await this.warehouseRepo.findById(warehouseId);
  
  // Owner luôn có quyền
  if (warehouse.owner_group_id === groupId) return true;
  
  // Kiểm tra shared
  if (warehouse.is_shared && warehouse.shared_groups?.includes(groupId)) {
    return true;
  }
  
  return false;
}
```

**Giải pháp 2: Warehouse độc lập, nhiều shop cùng quản lý**
```typescript
model WarehouseGroup {
  warehouse_id BigInt
  group_id     BigInt
  role         String // owner, manager, viewer
  
  @@id([warehouse_id, group_id])
}

// Mỗi shop có quyền riêng trên warehouse
```

---

### 5. CHECKLIST HOÀN THIỆN HỆ THỐNG

#### 5.1. Database Schema (Ưu tiên CAO)

- [ ] **Bổ sung `group_id` cho các bảng:**
  - [ ] `product_categories`
  - [ ] `product_variants`
  - [ ] `warehouses`
  - [ ] `warehouse_inventory`
  - [ ] `stock_transfers`
  - [ ] `payment_methods`
  - [ ] `shipping_methods`
  - [ ] `banners`
  - [ ] `product_reviews`

- [ ] **Thêm indexes:**
  - [ ] Index `group_id` cho tất cả bảng có `group_id`
  - [ ] Composite index `(group_id, status)` cho các bảng có status
  - [ ] Composite index `(group_id, created_at)` cho các bảng cần sort theo thời gian

- [ ] **Thêm constraints:**
  - [ ] Foreign key `group_id` → `groups(id)`
  - [ ] Check constraint đảm bảo dữ liệu liên quan cùng group

---

#### 5.2. Application Logic (Ưu tiên CAO)

- [ ] **Service Layer:**
  - [ ] Áp dụng `prepareFilters()` cho TẤT CẢ service
  - [ ] Áp dụng `verifyGroupOwnership()` cho TẤT CẢ CRUD operations
  - [ ] Implement logic tự động gán `group_id` khi create

- [ ] **Repository Layer:**
  - [ ] Update repository để support filter theo `group_id`
  - [ ] Thêm method `findByGroupId()` cho các repository

- [ ] **Public API:**
  - [ ] Logic tự động gán `group_id` cho Order từ Product
  - [ ] Logic tách Order theo shop nếu cart có nhiều shop
  - [ ] Validate coupon phải cùng shop với product

---

#### 5.3. Security (Ưu tiên CAO)

- [ ] **Guard/Middleware:**
  - [ ] Tạo `GroupOwnershipGuard` áp dụng global
  - [ ] Tạo `ShopContextMiddleware` để set context cho mỗi request
  - [ ] Validate `groupId` trong RequestContext

- [ ] **Authorization:**
  - [ ] Kiểm tra user có quyền truy cập group không
  - [ ] Kiểm tra cross-shop access attempts
  - [ ] Log tất cả các truy cập cross-shop

---

#### 5.4. Testing (Ưu tiên TRUNG BÌNH)

- [ ] **Unit Tests:**
  - [x] **Seeder & Mock Data:** Đã cập nhật seeder hỗ trợ multi-shop (shop1, shop2, global).
  - [ ] Test `prepareFilters()` với nhiều context
  - [ ] Test `verifyGroupOwnership()` với các trường hợp edge case
  - [ ] Test logic tách order theo shop

- [ ] **Integration Tests:**
  - [ ] Test user Shop A không thể truy cập dữ liệu Shop B
  - [ ] Test shared warehouse giữa các shop
  - [ ] Test order flow từ cart có nhiều shop

- [ ] **E2E Tests:**
  - [ ] Test toàn bộ flow: Tạo shop → Tạo product → Đặt hàng → Quản lý
  - [ ] Test permission của các role khác nhau

---

#### 5.5. Documentation (Ưu tiên THẤP)

- [ ] **Architecture Documentation:**
  - [ ] Mô tả multi-tenancy architecture
  - [ ] Diagram luồng dữ liệu giữa các shop
  - [ ] Giải thích cơ chế phân quyền

- [ ] **API Documentation:**
  - [ ] Document các endpoint theo shop context
  - [ ] Ví dụ request/response cho multi-shop
  - [ ] Error codes liên quan đến shop access

- [ ] **Developer Guide:**
  - [ ] Hướng dẫn thêm module mới với multi-shop support
  - [ ] Best practices khi làm việc với `group_id`
  - [ ] Common pitfalls và cách tránh

---

## 📊 BẢNG ĐÁNH GIÁ TỔNG QUAN

| Tiêu chí | Điểm | Ghi chú |
|----------|------|---------|
| **Kiến trúc phân quyền** | 9/10 | RBAC hoàn chỉnh, thiếu guard toàn cục |
| **Database schema** | 6/10 | Thiếu `group_id` ở nhiều bảng quan trọng |
| **Service logic** | 7/10 | Đã có filter/verify, chưa áp dụng đầy đủ |
| **Security** | 5/10 | Thiếu guard, middleware, constraint |
| **Public API** | 4/10 | Chưa có logic multi-shop cho order |
| **Warehouse** | 3/10 | Chưa có `group_id`, chưa có cơ chế chia sẻ |
| **Testing** | 2/10 | Chưa có test cho multi-shop |
| **Documentation** | 1/10 | Chưa có tài liệu về multi-tenancy |

**TỔNG ĐIỂM:** **37/80** (46.25%)

---

## 🎯 ROADMAP HOÀN THIỆN

### Phase 1: Critical Fixes (1-2 tuần)
1. ✅ Bổ sung `group_id` cho tất cả bảng cần thiết
2. ✅ Thêm indexes và foreign keys
3. ✅ Implement `GroupOwnershipGuard` global
4. ✅ Fix warehouse module để support `group_id`
5. ✅ Fix public API order creation logic

### Phase 2: Enhancement (2-3 tuần)
1. ✅ Implement shared warehouse mechanism
2. ✅ Thêm check constraints ở database
3. ✅ Viết unit tests cho multi-shop logic
4. ✅ Viết integration tests
5. ✅ Tạo service tự động setup shop mới

### Phase 3: Polish (1-2 tuần)
1. ✅ Viết E2E tests
2. ✅ Hoàn thiện documentation
3. ✅ Performance optimization
4. ✅ Security audit
5. ✅ User acceptance testing

---

## ⚠️ RỦI RO VÀ GIẢI PHÁP

### Rủi ro 1: Data Leakage giữa các shop
**Mức độ:** 🔴 **CAO**

**Nguyên nhân:**
- Thiếu `group_id` ở nhiều bảng
- Chưa có guard toàn cục
- Chưa có constraint ở database

**Giải pháp:**
- Bổ sung `group_id` ngay lập tức
- Implement `GroupOwnershipGuard`
- Thêm database constraints
- Audit log mọi cross-shop access

---

### Rủi ro 2: Performance khi có nhiều shop
**Mức độ:** 🟡 **TRUNG BÌNH**

**Nguyên nhân:**
- Mỗi query đều phải filter theo `group_id`
- Chưa có index tối ưu
- Chưa có caching strategy

**Giải pháp:**
- Thêm composite indexes `(group_id, ...)`
- Implement Redis caching cho data thường xuyên truy cập
- Partition database theo `group_id` nếu cần
- Monitor query performance

---

### Rủi ro 3: Nhầm lẫn khi chia sẻ warehouse
**Mức độ:** 🟡 **TRUNG BÌNH**

**Nguyên nhân:**
- Chưa có cơ chế rõ ràng cho shared warehouse
- Có thể xảy ra conflict khi nhiều shop cùng quản lý

**Giải pháp:**
- Implement `WarehouseGroup` table
- Định nghĩa rõ quyền (owner, manager, viewer)
- UI/UX rõ ràng khi chia sẻ warehouse
- Audit log mọi thao tác trên shared warehouse

---

## 📝 KẾT LUẬN

### Câu trả lời cho các câu hỏi của bạn:

#### 1. **Luồng ecommerce hiện tại đã ổn chưa?**
→ **Chưa hoàn toàn ổn.** Cần bổ sung `group_id` và các cơ chế bảo mật.

#### 2. **Đã dùng cho các shop được chưa?**
→ **Có thể dùng được** nhưng **RỦI RO CAO** về data leakage. Cần khắc phục Phase 1 trước khi deploy production.

#### 3. **Nhiều shop cùng bán hàng được chưa?**
→ **Được**, nhưng cần:
- Bổ sung `group_id` cho warehouse, payment, shipping
- Logic tách order theo shop
- Guard toàn cục

#### 4. **Có lẫn lộn quản lý gì không?**
→ **CÓ**, cụ thể:
- Warehouse: Shop A có thể thấy/sửa kho của Shop B
- Product Category: Các shop dùng chung category
- Payment/Shipping Method: Các shop dùng chung config
- Product Review: Không phân biệt review của shop nào

#### 5. **Hệ thống phân quyền theo group_id có đúng không?**
→ **ĐÚNG HƯỚNG**, nhưng:
- Cần áp dụng đầy đủ cho tất cả bảng
- Cần thêm guard/middleware
- Cần thêm database constraints

---

### Khuyến nghị cuối cùng:

**🔴 KHÔNG NÊN** deploy production cho multi-shop ngay bây giờ.

**✅ NÊN** hoàn thành Phase 1 (Critical Fixes) trước, sau đó:
1. Test kỹ với 2-3 shop demo
2. Security audit
3. Performance testing
4. Mới deploy production

**Thời gian ước tính:** 3-4 tuần để hệ thống sẵn sàng production cho multi-shop.

---

**Người đánh giá:** AI Assistant  
**Ngày:** 31/01/2026  
**Version:** 1.0
