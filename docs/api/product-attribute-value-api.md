# Tích hợp API quản lý Giá trị thuộc tính sản phẩm (Admin)

- **Mục tiêu**
  - Cho phép admin quản lý các giá trị thuộc tính sản phẩm (Product Attribute Values) trong hệ thống.
  - FE Admin có thể: xem danh sách, lấy danh sách đơn giản, lấy theo thuộc tính, xem chi tiết, tạo mới, cập nhật, khôi phục, xoá.

## Cấu trúc & bảo mật

- **Base URL**: `http://localhost:3000/api`
- **Prefix module**: `admin/product-attribute-values` (từ `@Controller('admin/product-attribute-values')`)
- **Authentication**: JWT Bearer Token (bắt buộc)
- **Guards**:
  - `JwtAuthGuard`
  - `RbacGuard`
- **Permission bắt buộc**: `product_attribute_value.manage`
- **Headers chuẩn**:
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`

---

## 1. Lấy danh sách giá trị thuộc tính (có phân trang)

### Endpoint

- `GET /api/admin/product-attribute-values`

### Query parameters

- `page` (optional): số trang (mặc định 1)
- `limit` (optional): số bản ghi mỗi trang (mặc định 20)
- `search` (optional): tìm kiếm theo value/label
- `attribute_id` (optional): lọc theo ID thuộc tính
- `product_variant_id` (optional): lọc theo ID biến thể sản phẩm
- `include_deleted` (optional, boolean): bao gồm các bản ghi đã xóa
- `sort` (optional): sắp xếp dạng `field:direction`, ví dụ `sort_order:ASC`, `created_at:DESC`

### Response mẫu

**Success (200):**

```json
{
  "data": [
    {
      "id": "1",
      "product_attribute_id": "1",
      "value": "Đỏ",
      "label": "Màu đỏ",
      "color_code": "#FF0000",
      "sort_order": 0,
      "created_user_id": "1",
      "updated_user_id": "1",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "deleted_at": null,
      "attribute": {
        "id": "1",
        "name": "Màu sắc",
        "code": "color",
        "type": "color"
      }
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemCount": 10,
    "itemsPerPage": 20,
    "totalItems": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Use-case FE

- Màn hình: **Danh sách giá trị thuộc tính**
  - Bảng hiển thị các giá trị, có thể filter theo thuộc tính, tìm kiếm
  - Có thể sắp xếp theo sort_order, ngày tạo

---

## 2. Lấy danh sách đơn giản (simple list)

### Endpoint

- `GET /api/admin/product-attribute-values/simple`

### Query parameters

- Tương tự endpoint `GET /api/admin/product-attribute-values` nhưng giới hạn `limit=1000`
- Dùng cho dropdown/select

### Response mẫu

**Success (200):**

```json
{
  "data": [
    {
      "id": "1",
      "product_attribute_id": "1",
      "value": "Đỏ",
      "label": "Màu đỏ",
      "color_code": "#FF0000",
      "sort_order": 0
    },
    {
      "id": "2",
      "product_attribute_id": "1",
      "value": "Xanh",
      "label": "Màu xanh",
      "color_code": "#0000FF",
      "sort_order": 1
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemCount": 2,
    "itemsPerPage": 1000,
    "totalItems": 2,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Use-case FE

- Dùng để load danh sách giá trị trong form tạo/sửa biến thể sản phẩm
- Dropdown: `Chọn giá trị thuộc tính`

---

## 3. Lấy danh sách giá trị theo thuộc tính

### Endpoint

- `GET /api/admin/product-attribute-values/attribute/:attributeId`

### Params

- `attributeId`: number – ID thuộc tính sản phẩm

### Response mẫu

**Success (200):**

```json
[
  {
    "id": "1",
    "product_attribute_id": "1",
    "value": "Đỏ",
    "label": "Màu đỏ",
    "color_code": "#FF0000",
    "sort_order": 0,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  {
    "id": "2",
    "product_attribute_id": "1",
    "value": "Xanh",
    "label": "Màu xanh",
    "color_code": "#0000FF",
    "sort_order": 1,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  }
]
```

### Use-case FE

- Khi chọn một thuộc tính trong form, tự động load các giá trị của thuộc tính đó
- Hiển thị trong dropdown/radio/checkbox tùy theo type của thuộc tính

---

## 4. Lấy chi tiết một giá trị thuộc tính theo ID

### Endpoint

- `GET /api/admin/product-attribute-values/:id`

### Params

- `id`: number – ID giá trị thuộc tính

### Response mẫu

**Success (200):**

```json
{
  "id": "1",
  "product_attribute_id": "1",
  "value": "Đỏ",
  "label": "Màu đỏ",
  "color_code": "#FF0000",
  "sort_order": 0,
  "created_user_id": "1",
  "updated_user_id": "1",
  "created_at": "2025-01-11T05:00:00.000Z",
  "updated_at": "2025-01-11T05:00:00.000Z",
  "deleted_at": null,
  "attribute": {
    "id": "1",
    "name": "Màu sắc",
    "code": "color",
    "type": "color"
  }
}
```

### Use-case FE

- Form **Edit Giá trị thuộc tính**
  - Khi mở màn sửa, FE gọi endpoint này để lấy dữ liệu ban đầu cho form

---

## 5. Tạo mới giá trị thuộc tính

### Endpoint

- `POST /api/admin/product-attribute-values`

### Request body (DTO `CreateProductAttributeValueDto`)

```json
{
  "attribute_id": 1,
  "value": "Đỏ",
  "label": "Màu đỏ",
  "color_code": "#FF0000",
  "sort_order": 0,
  "product_variant_id": null
}
```

**Fields:**

- `attribute_id` (number, **required**): ID thuộc tính sản phẩm
- `value` (string, **required**): Giá trị (ví dụ: "Đỏ", "XL", "Cotton")
- `label` (string, optional): Nhãn hiển thị (nếu không có sẽ dùng value)
- `color_code` (string, optional): Mã màu hex (dùng cho thuộc tính màu sắc)
- `sort_order` (number, optional): Thứ tự sắp xếp (mặc định 0)
- `product_variant_id` (number, optional): ID biến thể sản phẩm (nếu gán trực tiếp)
- `created_user_id` (number, optional): ID người tạo (tự động lấy từ token)

### Response

**Success (201 Created):**

```json
{
  "id": "10",
  "product_attribute_id": "1",
  "value": "Đỏ",
  "label": "Màu đỏ",
  "color_code": "#FF0000",
  "sort_order": 0,
  "created_at": "2025-01-11T05:00:00.000Z",
  "updated_at": "2025-01-11T05:00:00.000Z"
}
```

### Use-case FE

- Màn "Thêm giá trị thuộc tính"
  - Chọn thuộc tính từ dropdown (gọi `GET /api/admin/product-attributes/simple`)
  - Nhập value, label, color_code (nếu là màu), sort_order
  - Submit form → gọi `POST /api/admin/product-attribute-values`

---

## 6. Cập nhật giá trị thuộc tính

### Endpoint

- `PUT /api/admin/product-attribute-values/:id`

### Params

- `id`: number – ID giá trị thuộc tính cần cập nhật

### Request body (DTO `UpdateProductAttributeValueDto`)

- Tất cả các field **optional**, chỉ gửi các field cần cập nhật

```json
{
  "value": "Đỏ đậm",
  "label": "Màu đỏ đậm",
  "color_code": "#CC0000",
  "sort_order": 1
}
```

**Fields:**

- `attribute_id` (number, optional): ID thuộc tính sản phẩm
- `value` (string, optional): Giá trị
- `label` (string, optional): Nhãn hiển thị
- `color_code` (string, optional): Mã màu hex
- `sort_order` (number, optional): Thứ tự sắp xếp
- `product_variant_id` (number, optional): ID biến thể sản phẩm
- `updated_user_id` (number, optional): ID người cập nhật (tự động lấy từ token)

### Response

**Success (200):**

```json
{
  "id": "1",
  "product_attribute_id": "1",
  "value": "Đỏ đậm",
  "label": "Màu đỏ đậm",
  "color_code": "#CC0000",
  "sort_order": 1,
  "updated_at": "2025-01-11T06:00:00.000Z"
}
```

### Use-case FE

- Màn "Sửa giá trị thuộc tính"
  - Cho phép đổi value, label, color_code, sort_order

---

## 7. Khôi phục (restore) giá trị thuộc tính

### Endpoint

- `PUT /api/admin/product-attribute-values/:id/restore`

### Params

- `id`: number – ID giá trị thuộc tính đã bị xoá mềm (soft delete)

### Response

**Success (200):**

```json
{
  "id": "5",
  "product_attribute_id": "1",
  "value": "Vàng",
  "label": "Màu vàng",
  "color_code": "#FFFF00",
  "sort_order": 2,
  "deleted_at": null,
  "updated_at": "2025-01-11T07:00:00.000Z"
}
```

### Use-case FE

- Màn "Thùng rác" hoặc có filter `include_deleted=true`
  - Admin có thể khôi phục lại giá trị thuộc tính đã bị xoá

---

## 8. Xoá giá trị thuộc tính

### Endpoint

- `DELETE /api/admin/product-attribute-values/:id`

### Params

- `id`: number – ID cần xoá

### Hành vi

- Gọi `productAttributeValueService.delete(id)`:
  - Thường là **soft delete** (đánh dấu `deleted_at`), tuỳ base service

### Response

**Success (200):**

```json
{
  "success": true,
  "data": null,
  "message": "Xóa thành công"
}
```

### Use-case FE

- Trong bảng list:
  - Nút "Xoá" trên từng row
  - Sau khi xoá, FE reload list hoặc loại bỏ item khỏi state

---

## 9. Gợi ý tích hợp FE Admin

- **1. Màn danh sách**
  - Route gợi ý: `/admin/ecommerce/product-attribute-values`
  - Gọi `GET /api/admin/product-attribute-values?page=1&limit=20`
  - Chức năng:
    - Filter theo `attribute_id`, `product_variant_id`
    - Tìm kiếm theo `value`/`label`
    - Actions: Sửa, Xoá, Khôi phục

- **2. Màn tạo/sửa giá trị**
  - Dùng `simple` list để chọn thuộc tính:
    - `GET /api/admin/product-attributes/simple`
  - Submit:
    - Tạo mới → `POST /api/admin/product-attribute-values`
    - Cập nhật → `PUT /api/admin/product-attribute-values/:id`

- **3. Tích hợp với form biến thể sản phẩm**
  - Khi chọn thuộc tính, tự động load giá trị:
    - `GET /api/admin/product-attribute-values/attribute/:attributeId`
  - Hiển thị dạng dropdown/radio/checkbox tùy `type` của thuộc tính

- **4. Khôi phục / Thùng rác**
  - Nếu có UI thùng rác:
    - Dùng `PUT /api/admin/product-attribute-values/:id/restore` để khôi phục

---

## 10. Lưu ý kỹ thuật

- **ID dạng BigInt**: Tất cả ID trả về dạng string (do BigInt trong Prisma)
- **Soft Delete**: Xoá mềm, có thể khôi phục
- **Validation**:
  - `attribute_id` bắt buộc khi tạo mới
  - `value` bắt buộc, tối đa 255 ký tự
  - `color_code` tối đa 100 ký tự
- **Quan hệ**:
  - Một giá trị thuộc tính thuộc về một thuộc tính (`product_attribute_id`)
  - Có thể được gán cho nhiều biến thể sản phẩm qua bảng `product_variant_attributes`

