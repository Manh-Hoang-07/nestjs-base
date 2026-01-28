# Tích hợp API Biến thể sản phẩm (Product Variants) & Kho hàng/Tồn kho (Warehouses/Inventory) - Admin

- **Mục tiêu**
  - FE Admin có thể quản lý **biến thể sản phẩm** (tạo/cập nhật/xoá/khôi phục, tra cứu theo SKU, lấy theo sản phẩm).
  - FE Admin có thể quản lý **kho hàng** và thao tác **tồn kho/chuyển kho**.

## Cấu trúc & bảo mật

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT Bearer Token (bắt buộc)
- **Guards**:
  - `JwtAuthGuard`
  - `RbacGuard`
- **Headers chuẩn**:
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`

## Format response chuẩn (list phân trang)

Các API dạng list trả về:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false,
    "previousPage": null
  }
}
```

Ghi chú:
- `nextPage` hiện **không** được set trong helper phân trang (đừng phụ thuộc), FE nên tự tính từ `page`, `totalPages`.

---

## A. Product Variants (Admin)

- **Prefix module**: `admin/product-variants` (từ `@Controller('admin/product-variants')`)
- **Permission bắt buộc**: `product_variant.manage`

### A1. Lấy danh sách biến thể (phân trang)

- **Endpoint**: `GET /api/admin/product-variants`

#### Query parameters

Hệ thống hỗ trợ các “standard options”:
- `page` (optional, number)
- `limit` (optional, number)
- `sort` (optional): dạng `field:ASC|DESC` (ví dụ `created_at:DESC`)
- `sort_by` + `sort_order` (optional): nếu không truyền `sort` thì có thể dùng 2 tham số này (tương thích ngược)

Các query còn lại sẽ được coi như **filter** và forward xuống repository (tuỳ module xử lý).

> Lưu ý: hiện repo `product-variant` có filter chuẩn hoá kiểu domain là `productId/isActive/search`, nhưng controller đang forward filter “phẳng” (ví dụ `product_id`, `search`, `include_deleted`...). Nếu bạn thấy filter chưa ăn, check lại BE mapping filter (có thể cần chỉnh BE).

**Mặc định response**: trả payload gọn + `attributes` dạng **summary** (chỉ gồm `product_attribute_id` và `product_attribute_value_id`, không trả `attribute_value`).

**Nếu cần full attributes sâu**: thêm query `?include_attributes=true`.

#### Ví dụ request

```bash
curl --location "http://localhost:3000/api/admin/product-variants?page=1&limit=20&sort=created_at:DESC&search=RED&product_id=1" ^
  --header "Authorization: Bearer {{auth_token}}"
```

### A2. Lấy danh sách biến thể (simple)

- **Endpoint**: `GET /api/admin/product-variants/simple`
- Trả payload **tối giản**, KHÔNG include `attributes` (phù hợp render bảng/list).

### A3. Lấy biến thể theo sản phẩm

- **Endpoint**: `GET /api/admin/product-variants/product/:productId`
- **Param**:
  - `productId` (number)
- **Ghi chú**: BE set sẵn `sort=created_at:DESC` và `limit=1000`.

```bash
curl --location "http://localhost:3000/api/admin/product-variants/product/1" ^
  --header "Authorization: Bearer {{auth_token}}"
```

### A4. Tìm biến thể theo tổ hợp thuộc tính (search)

- **Endpoint**: `POST /api/admin/product-variants/search`
- **Body**:
  - `product_id` (optional, number)
  - `attributes` (optional, array):
    - `attribute_id` (number)
    - `value_id` (number)

> Lưu ý quan trọng: service `searchVariants(...)` hiện là **placeholder** (chỉ trả list theo `product_id`), chưa filter theo `attributes`.

```bash
curl --location "http://localhost:3000/api/admin/product-variants/search" ^
  --header "Authorization: Bearer {{auth_token}}" ^
  --header "Content-Type: application/json" ^
  --data "{\"product_id\":1,\"attributes\":[{\"attribute_id\":10,\"value_id\":100}]}"
```

### A5. Lấy biến thể theo SKU

- **Endpoint**: `GET /api/admin/product-variants/sku/:sku`
- **Param**:
  - `sku` (string)
- **Mặc định**: trả payload gọn + `attributes` dạng **summary**
- **Nếu cần attributes**: thêm query `?include_attributes=true`

```bash
curl --location "http://localhost:3000/api/admin/product-variants/sku/ATN001-RED-M" ^
  --header "Authorization: Bearer {{auth_token}}"
```

### A6. Lấy chi tiết biến thể theo ID

- **Endpoint**: `GET /api/admin/product-variants/:id`
- **Param**:
  - `id` (number)
- **Mặc định**: trả payload gọn + `attributes` dạng **summary**
- **Nếu cần attributes**: thêm query `?include_attributes=true`

### A6.1. Trả về đầy đủ attributes (tuỳ chọn)

- **Áp dụng cho**:
  - `GET /api/admin/product-variants`
  - `GET /api/admin/product-variants/product/:productId`
  - `GET /api/admin/product-variants/sku/:sku`
  - `GET /api/admin/product-variants/:id`
- **Cách dùng**: thêm query `?include_attributes=true`

### A7. Tạo biến thể

- **Endpoint**: `POST /api/admin/product-variants`
- **Body** (theo DTO):
  - `product_id` (number, required)
  - `name` (string, required, max 255)
  - `slug` (string, optional, max 255)
  - `sku` (string, required, max 100)
  - `price` (string, required) (đang để string, FE gửi `"299000"`)
  - `sale_price` (string, optional)
  - `cost_price` (string, optional)
  - `stock_quantity` (number, required, min 0)
  - `weight` (string, optional)
  - `image` (string, optional, max 500)
  - `status` (optional): enum `BasicStatus` (thường dùng `active|inactive`)

> Ghi chú: BE sẽ convert `status` -> `is_active` (active => true), sau đó xoá field `status` trước khi insert.

```bash
curl --location "http://localhost:3000/api/admin/product-variants" ^
  --header "Authorization: Bearer {{auth_token}}" ^
  --header "Content-Type: application/json" ^
  --data "{\"product_id\":1,\"name\":\"Áo thun - Đỏ - M\",\"sku\":\"ATN001-RED-M\",\"price\":\"299000\",\"sale_price\":\"249000\",\"stock_quantity\":50,\"status\":\"active\"}"
```

### A8. Cập nhật biến thể

- **Endpoint**: `PUT /api/admin/product-variants/:id`
- **Body**: giống Create nhưng **optional hết** (PartialType)

### A9. Xoá mềm biến thể

- **Endpoint**: `DELETE /api/admin/product-variants/:id`

### A10. Khôi phục biến thể đã xoá

- **Endpoint**: `PUT /api/admin/product-variants/:id/restore`

---

## B. Warehouses / Inventory (Admin)

- **Prefix module**: `admin/warehouses` (từ `@Controller('admin/warehouses')`)
- **Permissions**:
  - Quản lý kho: `warehouse.manage`
  - Quản lý tồn kho: `warehouse_inventory.manage`
  - Quản lý chuyển kho: `warehouse_transfer.manage`

### B1. Lấy danh sách kho (phân trang)

- **Endpoint**: `GET /api/admin/warehouses`
- **Permission**: `warehouse.manage`
- **Query parameters**:
  - standard options: `page`, `limit`, `sort`, `sort_by`, `sort_order`
  - filter phổ biến (tuỳ BE xử lý): `search`, `code`, `status`

### B2. Lấy danh sách kho (simple)

- **Endpoint**: `GET /api/admin/warehouses/simple`
- **Permission**: `warehouse.manage`
- Hiện tại controller đang gọi cùng logic với list thường (chưa thấy select tối giản riêng).

### B3. Xem chi tiết kho

- **Endpoint**: `GET /api/admin/warehouses/:id`
- **Permission**: `warehouse.manage`

### B4. Xem tồn kho của 1 kho

- **Endpoint**: `GET /api/admin/warehouses/:id/inventory`
- **Permission**: `warehouse_inventory.manage`
- **Query**:
  - `low_stock` (optional, boolean string): `true|false`

> Lưu ý quan trọng: `getWarehouseInventory(...)` hiện là **placeholder** và đang trả `[]`.

```bash
curl --location "http://localhost:3000/api/admin/warehouses/1/inventory?low_stock=true" ^
  --header "Authorization: Bearer {{auth_token}}"
```

### B5. Tạo kho

- **Endpoint**: `POST /api/admin/warehouses`
- **Permission**: `warehouse.manage`
- **Body**:
  - `code` (string, required, max 100)
  - `name` (string, required, max 255)
  - `address` (string, optional)
  - `city` (string, optional, max 100)
  - `district` (string, optional, max 100)
  - `latitude` (number, optional)
  - `longitude` (number, optional)
  - `phone` (string, optional, max 20)
  - `manager_name` (string, optional, max 255)
  - `priority` (number, optional, min 0)
  - `is_active` (boolean, optional)

### B6. Cập nhật kho

- **Endpoint**: `PUT /api/admin/warehouses/:id`
- **Permission**: `warehouse.manage`

### B7. Xoá mềm kho

- **Endpoint**: `DELETE /api/admin/warehouses/:id`
- **Permission**: `warehouse.manage`

### B8. Cập nhật tồn kho cho biến thể tại kho

- **Endpoint**: `PUT /api/admin/warehouses/inventory/update`
- **Permission**: `warehouse_inventory.manage`
- **Body**:
  - `warehouse_id` (number, required, min 1)
  - `product_variant_id` (number, required, min 1)
  - `quantity` (number, required, min 0)
  - `min_stock_level` (number, optional, min 0)

> Lưu ý quan trọng: `updateInventoryStock(...)` hiện là **placeholder** và đang trả `{ "success": true }`.

```bash
curl --location --request PUT "http://localhost:3000/api/admin/warehouses/inventory/update" ^
  --header "Authorization: Bearer {{auth_token}}" ^
  --header "Content-Type: application/json" ^
  --data "{\"warehouse_id\":1,\"product_variant_id\":10,\"quantity\":120,\"min_stock_level\":10}"
```

### B9. Tạo phiếu chuyển kho

- **Endpoint**: `POST /api/admin/warehouses/transfers`
- **Permission**: `warehouse_transfer.manage`
- **Body**:
  - `from_warehouse_id` (number, required, min 1)
  - `to_warehouse_id` (number, required, min 1)
  - `product_variant_id` (number, required, min 1)
  - `quantity` (number, required, min 1)
  - `notes` (string, optional)

> Lưu ý quan trọng: `createStockTransfer(...)` hiện là **placeholder** và đang trả `{ "success": true }`.

### B10. Danh sách phiếu chuyển kho

- **Endpoint**: `GET /api/admin/warehouses/transfers/list`
- **Permission**: `warehouse_transfer.manage`
- **Query**:
  - `status` (optional, string)
  - `warehouse_id` (optional, number string)

> Lưu ý quan trọng: `getStockTransfers(...)` hiện là **placeholder** và đang trả `[]`.

### B11. Duyệt phiếu chuyển kho

- **Endpoint**: `PUT /api/admin/warehouses/transfers/:id/approve`
- **Permission**: `warehouse_transfer.manage`

> Lưu ý quan trọng: `approveStockTransfer(...)` hiện là **placeholder** và đang trả `{ "success": true }`.

### B12. Hoàn tất phiếu chuyển kho

- **Endpoint**: `PUT /api/admin/warehouses/transfers/:id/complete`
- **Permission**: `warehouse_transfer.manage`

> Lưu ý quan trọng: `completeStockTransfer(...)` hiện là **placeholder** và đang trả `{ "success": true }`.

### B13. Huỷ phiếu chuyển kho

- **Endpoint**: `PUT /api/admin/warehouses/transfers/:id/cancel`
- **Permission**: `warehouse_transfer.manage`

> Lưu ý quan trọng: `cancelStockTransfer(...)` hiện là **placeholder** và đang trả `{ "success": true }`.

---

## Checklist cho FE khi lắp UI

- **Variants**
  - List theo `product_id` dùng `GET /admin/product-variants/product/:productId` (nhanh, limit 1000).
  - Tạo/cập nhật nhớ đồng bộ `sku`, `price` (string) và `stock_quantity` (number).
  - Nếu cần “tìm variant theo thuộc tính”, hiện endpoint `/search` chưa implement đúng (FE tạm fallback lấy list theo product rồi filter client nếu ít data).

- **Inventory/Warehouse**
  - Các API tồn kho/chuyển kho hiện đang placeholder -> FE nên xử lý “empty state”/toast “chưa hỗ trợ” tránh block luồng.


