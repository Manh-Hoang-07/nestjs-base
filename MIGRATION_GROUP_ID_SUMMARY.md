# MIGRATION SUMMARY - Bổ sung group_id cho Multi-Shop

**Ngày thực hiện:** 31/01/2026  
**Migration:** `20260131072405_add_group_id_to_ecommerce_tables`

---

## 📝 THAY ĐỔI DATABASE

### ✅ Các bảng đã bổ sung `group_id`

| Bảng | Cột mới | Quy tắc | Index |
|------|---------|---------|-------|
| `product_categories` | `group_id BIGINT UNSIGNED NULL` | NULL = global category<br>Có giá trị = riêng của group | `idx_product_categories_group_id` |
| `product_variants` | `group_id BIGINT UNSIGNED NULL` | Inherit từ product | `idx_product_variants_group_id` |
| `product_reviews` | `group_id BIGINT UNSIGNED NULL` | Inherit từ product | `idx_product_reviews_group_id` |
| `warehouses` | `group_id BIGINT UNSIGNED NULL` | NULL = shared warehouse<br>Có giá trị = riêng của group | `idx_warehouses_group_id` |
| `warehouse_inventory` | `group_id BIGINT UNSIGNED NULL` | Inherit từ warehouse hoặc product | `idx_wi_group_id` |
| `stock_transfers` | `group_id BIGINT UNSIGNED NULL` | Inherit từ warehouse hoặc product | `idx_st_group_id` |

### ➖ Các bảng KHÔNG bổ sung (dùng chung toàn hệ thống)

- `payment_methods` - Phương thức thanh toán chung
- `shipping_methods` - Phương thức vận chuyển chung
- `banners` - Banner chung

---

## 🎯 LOGIC PHÂN QUYỀN

### 1. Quy tắc `group_id = NULL`

**Ý nghĩa:** Dữ liệu dùng chung cho toàn hệ thống (global/shared)

**Áp dụng cho:**
- `product_categories`: Danh mục sản phẩm chung (VD: Điện thoại, Laptop)
- `warehouses`: Kho chia sẻ giữa nhiều shop

**Query pattern:**
```sql
-- Lấy danh mục: vừa global vừa riêng của group
SELECT * FROM product_categories
WHERE (group_id IS NULL OR group_id = :currentGroupId)
AND status = 'active';
```

### 2. Quy tắc `group_id = <value>`

**Ý nghĩa:** Dữ liệu riêng của 1 group cụ thể

**Áp dụng cho:**
- `product_categories`: Danh mục riêng của shop
- `product_variants`: Variant thuộc product của shop
- `product_reviews`: Review cho product của shop
- `warehouses`: Kho riêng của shop
- `warehouse_inventory`: Tồn kho theo shop
- `stock_transfers`: Giao dịch kho theo shop

**Query pattern:**
```sql
-- Lấy dữ liệu riêng của group
SELECT * FROM warehouses
WHERE group_id = :currentGroupId;
```

### 3. Quy tắc Inherit (Kế thừa)

**Các bảng kế thừa `group_id`:**

| Bảng con | Kế thừa từ | Logic |
|----------|------------|-------|
| `product_variants` | `products` | Variant cùng group với product |
| `product_reviews` | `products` | Review cùng group với product |
| `warehouse_inventory` | `warehouses` hoặc `products` | Ưu tiên warehouse, fallback product |
| `stock_transfers` | `warehouses` hoặc `products` | Ưu tiên warehouse, fallback product |

**Implementation:**
```typescript
// Khi tạo ProductVariant
async createVariant(productId: bigint, data: CreateVariantDto) {
  const product = await this.productRepo.findById(productId);
  
  return this.variantRepo.create({
    ...data,
    product_id: productId,
    group_id: product.group_id // ✅ Inherit từ product
  });
}
```

---

## 🔧 CẬP NHẬT CODE CẦN THIẾT

### 1. Repository Layer

#### ProductCategoryRepository
```typescript
// src/modules/ecommerce/product-category/infrastructure/repositories/product-category.repository.impl.ts

protected override buildWhere(filter: any): any {
  const where: any = {};
  
  // ✅ Filter theo group_id (bao gồm cả NULL)
  if (filter.groupId !== undefined) {
    if (filter.groupId === null) {
      where.group_id = null; // Chỉ lấy global
    } else {
      where.OR = [
        { group_id: null }, // Global categories
        { group_id: this.toPrimaryKey(filter.groupId) } // Group-specific
      ];
    }
  }
  
  // ... other filters
  return where;
}
```

#### WarehouseRepository
```typescript
// src/modules/ecommerce/warehouse/infrastructure/repositories/warehouse.repository.impl.ts

protected override buildWhere(filter: any): any {
  const where: any = {};
  
  // ✅ Filter theo group_id
  if (filter.groupId !== undefined) {
    if (filter.groupId === null) {
      where.group_id = null; // Chỉ lấy shared warehouses
    } else {
      where.OR = [
        { group_id: null }, // Shared warehouses
        { group_id: this.toPrimaryKey(filter.groupId) } // Group-specific
      ];
    }
  }
  
  return where;
}
```

### 2. Service Layer

#### ProductCategoryService
```typescript
// src/modules/ecommerce/product-category/admin/services/product-category.service.ts

protected override async prepareFilters(filters?: any): Promise<any> {
  const prepared = { ...(filters || {}) };
  
  if (prepared.group_id === undefined) {
    const contextId = RequestContext.get<number>('contextId');
    const groupId = RequestContext.get<number | null>('groupId');
    
    if (contextId && contextId !== 1 && groupId) {
      prepared.group_id = groupId; // ✅ Auto filter
    }
  }
  
  return prepared;
}

protected override async beforeCreate(data: any): Promise<any> {
  const payload = { ...data };
  
  // ✅ Auto assign group_id nếu không phải global
  if (payload.group_id === undefined && !payload.is_global) {
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId) {
      payload.group_id = groupId;
    }
  }
  
  return payload;
}
```

#### ProductVariantService
```typescript
// src/modules/ecommerce/product-variant/admin/services/product-variant.service.ts

protected override async beforeCreate(data: any): Promise<any> {
  const payload = { ...data };
  
  // ✅ Inherit group_id từ product
  if (payload.product_id) {
    const product = await this.productRepo.findById(payload.product_id);
    payload.group_id = product.group_id;
  }
  
  return payload;
}
```

#### WarehouseService
```typescript
// src/modules/ecommerce/warehouse/admin/services/warehouse.service.ts

protected override async prepareFilters(filters?: any): Promise<any> {
  const prepared = { ...(filters || {}) };
  
  if (prepared.group_id === undefined) {
    const contextId = RequestContext.get<number>('contextId');
    const groupId = RequestContext.get<number | null>('groupId');
    
    if (contextId && contextId !== 1 && groupId) {
      prepared.group_id = groupId; // ✅ Auto filter
    }
  }
  
  return prepared;
}

protected override async beforeCreate(data: any): Promise<any> {
  const payload = { ...data };
  
  // ✅ Auto assign group_id nếu không phải shared
  if (payload.group_id === undefined && !payload.is_shared) {
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId) {
      payload.group_id = groupId;
    }
  }
  
  return payload;
}
```

---

## 📋 CHECKLIST HOÀN THIỆN

### Phase 1: Database ✅
- [x] Bổ sung `group_id` cho 6 bảng
- [x] Thêm indexes cho performance
- [x] Run migration thành công

### Phase 2: Repository Layer (CẦN LÀM)
- [ ] Update `ProductCategoryRepository` - filter theo group_id
- [ ] Update `ProductVariantRepository` - filter theo group_id
- [ ] Update `ProductReviewRepository` - filter theo group_id
- [ ] Update `WarehouseRepository` - filter theo group_id
- [ ] Update `WarehouseInventoryRepository` - filter theo group_id
- [ ] Update `StockTransferRepository` - filter theo group_id

### Phase 3: Service Layer (CẦN LÀM)
- [ ] Update `ProductCategoryService` - prepareFilters + beforeCreate
- [ ] Update `ProductVariantService` - inherit group_id từ product
- [ ] Update `ProductReviewService` - inherit group_id từ product
- [ ] Update `WarehouseService` - prepareFilters + beforeCreate
- [ ] Update `WarehouseInventoryService` - inherit group_id
- [ ] Update `StockTransferService` - inherit group_id

### Phase 4: Seeder (CẦN LÀM)
- [ ] Update seeder để tạo dữ liệu mẫu với group_id
- [ ] Tạo global categories (group_id = NULL)
- [ ] Tạo group-specific categories
- [ ] Tạo shared warehouses (group_id = NULL)
- [ ] Tạo group-specific warehouses

### Phase 5: Testing (CẦN LÀM)
- [ ] Test filter categories: global + group-specific
- [ ] Test warehouse access: shared + group-specific
- [ ] Test variant inherit group_id từ product
- [ ] Test cross-shop access prevention
- [ ] Test query performance với indexes

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Dữ liệu cũ
- Tất cả dữ liệu hiện tại có `group_id = NULL`
- Cần update dữ liệu cũ nếu muốn gán vào group cụ thể

### 2. Query pattern
- **ĐÚNG:** `WHERE (group_id IS NULL OR group_id = :groupId)`
- **SAI:** `WHERE group_id = :groupId` (sẽ bỏ qua global data)

### 3. Validation
- Khi tạo variant: PHẢI có product_id để inherit group_id
- Khi tạo review: PHẢI có product_id để inherit group_id
- Khi tạo inventory: PHẢI có warehouse_id hoặc product_id

### 4. Performance
- Đã thêm indexes cho tất cả `group_id`
- Composite queries `(group_id IS NULL OR group_id = X)` vẫn sử dụng index hiệu quả

---

## 🎯 BƯỚC TIẾP THEO

1. **Cập nhật Repository Layer** (Ưu tiên CAO)
2. **Cập nhật Service Layer** (Ưu tiên CAO)
3. **Cập nhật Seeder** (Ưu tiên TRUNG BÌNH)
4. **Testing** (Ưu tiên TRUNG BÌNH)
5. **Documentation** (Ưu tiên THẤP)

---

**Người thực hiện:** AI Assistant  
**Ngày:** 31/01/2026  
**Status:** ✅ Database migration completed, Code updates pending
