# Tích hợp API quản lý Thuộc tính sản phẩm (Admin)

- **Mục tiêu**
  - Cho phép admin quản lý các thuộc tính sản phẩm (Product Attributes) trong hệ thống.
  - FE Admin có thể: xem danh sách, xem chi tiết, tạo mới, cập nhật, xoá.

## Cấu trúc & bảo mật

- **Base URL**: `http://localhost:3000/api`
- **Prefix module**: `admin/product-attributes` (từ `@Controller('admin/product-attributes')`)
- **Authentication**: JWT Bearer Token (bắt buộc)
- **Guards**:
  - `JwtAuthGuard`
  - `RbacGuard`
- **Permission bắt buộc**: `product_attribute.manage`
- **Headers chuẩn**:
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`

## Cấu trúc Response chuẩn

Tất cả các API đều trả về response theo format chuẩn:

```json
{
  "success": boolean,
  "message": string,
  "code": string,
  "httpStatus": number,
  "data": any,
  "meta": object,
  "timestamp": string
}
```

### Cấu trúc ProductAttribute Object

```typescript
{
  id: number;                          // ID thuộc tính
  name: string;                        // Tên thuộc tính
  code: string;                        // Mã thuộc tính (unique)
  description: string | null;         // Mô tả
  type: string;                        // Loại: "text" | "select" | "multiselect" | "color" | "image"
  default_value: string | null;        // Giá trị mặc định
  is_filterable: boolean;              // Có thể dùng để lọc
  is_required: boolean;               // Bắt buộc
  is_variation: boolean;               // Dùng cho biến thể
  is_visible_on_frontend: boolean;    // Hiển thị ở frontend
  sort_order: number;                  // Thứ tự sắp xếp
  status: "active" | "inactive";      // Trạng thái
  validation_rules: string | null;     // Quy tắc validation
  created_user_id: number | null;      // ID người tạo
  updated_user_id: number | null;      // ID người cập nhật
  created_at: string;                  // Ngày tạo (ISO 8601)
  updated_at: string;                  // Ngày cập nhật (ISO 8601)
  deleted_at: string | null;          // Ngày xóa (soft delete)
  values: ProductAttributeValue[];    // Danh sách giá trị thuộc tính
}
```

### Cấu trúc ProductAttributeValue Object

```typescript
{
  id: number;                          // ID giá trị
  product_attribute_id: number;        // ID thuộc tính cha
  value: string;                       // Giá trị (dùng để lưu)
  label: string;                       // Nhãn hiển thị
  color_code: string | null;           // Mã màu (nếu type = color)
  sort_order: number;                  // Thứ tự sắp xếp
  created_user_id: number | null;      // ID người tạo
  updated_user_id: number | null;      // ID người cập nhật
  created_at: string;                  // Ngày tạo
  updated_at: string;                  // Ngày cập nhật
  deleted_at: string | null;          // Ngày xóa
}
```

---

## 1. Lấy danh sách thuộc tính (có phân trang)

### Endpoint

- `GET /api/admin/product-attributes`

### Query parameters

- `page` (optional): số trang (mặc định 1)
- `limit` (optional): số bản ghi mỗi trang (mặc định 20)
- `search` (optional): tìm kiếm theo name/code
- `type` (optional): lọc theo loại thuộc tính (`text`, `select`, `multiselect`, `color`, `image`)
- `include_deleted` (optional, boolean): bao gồm các bản ghi đã xóa
- `include_values` (optional, boolean): bao gồm danh sách giá trị của thuộc tính
- `sort` (optional): sắp xếp dạng `field:direction`, ví dụ `sort_order:ASC`, `name:ASC`

### Response mẫu

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": [
    {
      "id": 1,
      "name": "Màu sắc",
      "code": "color",
      "description": "Thuộc tính màu sắc của sản phẩm",
      "type": "color",
      "default_value": null,
      "is_filterable": true,
      "is_required": true,
      "is_variation": true,
      "is_visible_on_frontend": true,
      "sort_order": 0,
      "status": "active",
      "validation_rules": null,
      "created_user_id": null,
      "updated_user_id": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "deleted_at": null,
      "values": [
        {
          "id": 1,
          "product_attribute_id": 1,
          "value": "Đỏ",
          "label": "Màu đỏ",
          "color_code": "#FF0000",
          "sort_order": 0,
          "created_user_id": null,
          "updated_user_id": null,
          "created_at": "2025-01-11T05:00:00.000Z",
          "updated_at": "2025-01-11T05:00:00.000Z",
          "deleted_at": null
        }
      ]
    },
    {
      "id": 2,
      "name": "Kích thước",
      "code": "size",
      "description": null,
      "type": "select",
      "default_value": null,
      "is_filterable": true,
      "is_required": true,
      "is_variation": true,
      "is_visible_on_frontend": true,
      "sort_order": 1,
      "status": "active",
      "validation_rules": null,
      "created_user_id": null,
      "updated_user_id": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "deleted_at": null,
      "values": []
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
  },
  "timestamp": "2025-01-11T05:00:00+07:00"
}
```

### Use-case FE

- Màn hình: **Danh sách thuộc tính sản phẩm**
  - Bảng hiển thị các thuộc tính, có thể filter theo type, tìm kiếm
  - Có thể hiển thị số lượng giá trị của mỗi thuộc tính
  - Có thể sắp xếp theo sort_order, ngày tạo

---

## 2. Lấy chi tiết một thuộc tính theo ID

### Endpoint

- `GET /api/admin/product-attributes/:id`

### Params

- `id`: string | number – ID thuộc tính

### Response mẫu

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 1,
    "name": "Màu sắc",
    "code": "color",
    "description": "Thuộc tính màu sắc của sản phẩm",
    "type": "color",
    "default_value": null,
    "is_filterable": true,
    "is_required": true,
    "is_variation": true,
    "is_visible_on_frontend": true,
    "sort_order": 0,
    "status": "active",
    "validation_rules": null,
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "deleted_at": null,
    "values": [
      {
        "id": 1,
        "product_attribute_id": 1,
        "value": "Đỏ",
        "label": "Màu đỏ",
        "color_code": "#FF0000",
        "sort_order": 0,
        "created_user_id": null,
        "updated_user_id": null,
        "created_at": "2025-01-11T05:00:00.000Z",
        "updated_at": "2025-01-11T05:00:00.000Z",
        "deleted_at": null
      },
      {
        "id": 2,
        "product_attribute_id": 1,
        "value": "Xanh",
        "label": "Màu xanh",
        "color_code": "#0000FF",
        "sort_order": 1,
        "created_user_id": null,
        "updated_user_id": null,
        "created_at": "2025-01-11T05:00:00.000Z",
        "updated_at": "2025-01-11T05:00:00.000Z",
        "deleted_at": null
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-01-11T05:00:00+07:00"
}
```

### Use-case FE

- Form **Edit Thuộc tính**
  - Khi mở màn sửa, FE gọi endpoint này để lấy dữ liệu ban đầu cho form
  - Hiển thị danh sách giá trị của thuộc tính

---

## 3. Tạo mới thuộc tính sản phẩm

### Endpoint

- `POST /api/admin/product-attributes`

### Request body (DTO `CreateProductAttributeDto`)

```json
{
  "name": "Màu sắc",
  "code": "color",
  "description": "Thuộc tính màu sắc của sản phẩm",
  "type": "color",
  "default_value": "",
  "is_required": true,
  "is_variation": true,
  "is_filterable": true,
  "is_visible_on_frontend": true,
  "sort_order": 0,
  "status": "active",
  "validation_rules": ""
}
```

**Fields:**

- `name` (string, **required**): Tên thuộc tính
- `code` (string, **required**): Mã thuộc tính (unique, dạng slug, ví dụ: "color", "size")
- `description` (string, optional): Mô tả thuộc tính
- `type` (enum, optional): Loại thuộc tính, mặc định `"text"`. Các giá trị:
  - `"text"`: Văn bản
  - `"select"`: Chọn một
  - `"multiselect"`: Chọn nhiều
  - `"color"`: Màu sắc
  - `"image"`: Hình ảnh
- `default_value` (string, optional): Giá trị mặc định
- `is_required` (boolean, optional): Bắt buộc hay không, mặc định `true`
- `is_variation` (boolean, optional): Dùng để tạo biến thể hay không
- `is_filterable` (boolean, optional): Có thể dùng để lọc sản phẩm hay không, mặc định `true`
- `is_visible_on_frontend` (boolean, optional): Hiển thị ở frontend hay không
- `sort_order` (number, optional): Thứ tự sắp xếp, mặc định `0`
- `status` (enum, optional): Trạng thái (`active` | `inactive`), mặc định `active`
- `validation_rules` (string, optional): Quy tắc validation (JSON string)
- `created_user_id` (number, optional): ID người tạo (tự động lấy từ token)

**Lưu ý:**
- Nếu không truyền `code`, hệ thống sẽ tự động generate từ `name` (slugify)
- Nếu `code` đã tồn tại, hệ thống sẽ tự động thêm timestamp vào cuối

### Response

**Success (201 Created):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 201,
  "data": {
    "id": 10,
    "name": "Màu sắc",
    "code": "color",
    "description": "Thuộc tính màu sắc của sản phẩm",
    "type": "color",
    "default_value": null,
    "is_filterable": true,
    "is_required": true,
    "is_variation": true,
    "is_visible_on_frontend": true,
    "sort_order": 0,
    "status": "active",
    "validation_rules": null,
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "deleted_at": null,
    "values": []
  },
  "meta": {},
  "timestamp": "2025-01-11T05:00:00+07:00"
}
```

### Use-case FE

- Màn "Thêm thuộc tính"
  - Nhập name, code (hoặc để tự động), chọn type
  - Cấu hình các flag: is_required, is_variation, is_filterable, is_visible_on_frontend
  - Submit form → gọi `POST /api/admin/product-attributes`
  - Sau khi tạo, có thể thêm các giá trị thuộc tính qua API `POST /api/admin/product-attribute-values`

---

## 4. Cập nhật thuộc tính sản phẩm

### Endpoint

- `PUT /api/admin/product-attributes/:id`

### Params

- `id`: string | number – ID thuộc tính cần cập nhật

### Request body (DTO `UpdateProductAttributeDto`)

- Tất cả các field **optional**, chỉ gửi các field cần cập nhật

```json
{
  "name": "Màu sắc & Họa tiết",
  "is_filterable": false,
  "sort_order": 5
}
```

**Fields:**

- `name` (string, optional): Tên thuộc tính
- `code` (string, optional): Mã thuộc tính (nếu thay đổi sẽ check duplicate)
- `description` (string, optional): Mô tả
- `type` (enum, optional): Loại thuộc tính
- `default_value` (string, optional): Giá trị mặc định
- `is_required` (boolean, optional): Bắt buộc
- `is_variation` (boolean, optional): Dùng cho biến thể
- `is_filterable` (boolean, optional): Có thể lọc
- `is_visible_on_frontend` (boolean, optional): Hiển thị frontend
- `sort_order` (number, optional): Thứ tự sắp xếp
- `status` (enum, optional): Trạng thái
- `validation_rules` (string, optional): Quy tắc validation
- `updated_user_id` (number, optional): ID người cập nhật (tự động lấy từ token)

**Lưu ý:**
- Nếu thay đổi `code` và code mới đã tồn tại (khác ID hiện tại), hệ thống sẽ tự động thêm timestamp

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 1,
    "name": "Màu sắc & Họa tiết",
    "code": "color",
    "description": "Thuộc tính màu sắc và họa tiết",
    "type": "color",
    "default_value": null,
    "is_filterable": false,
    "is_required": true,
    "is_variation": true,
    "is_visible_on_frontend": true,
    "sort_order": 5,
    "status": "active",
    "validation_rules": null,
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z",
    "deleted_at": null,
    "values": []
  },
  "meta": {},
  "timestamp": "2025-01-11T06:00:00+07:00"
}
```

### Use-case FE

- Màn "Sửa thuộc tính"
  - Cho phép đổi tên, code, type, các flag, sort_order
  - Lưu ý: Thay đổi type có thể ảnh hưởng đến các giá trị thuộc tính đã có

---

## 5. Xoá thuộc tính sản phẩm

### Endpoint

- `DELETE /api/admin/product-attributes/:id`

### Params

- `id`: string | number – ID cần xoá

### Hành vi

- Gọi `productAttributeService.delete(id)`:
  - Thường là **soft delete** (đánh dấu `deleted_at`), tuỳ base service
  - **Lưu ý**: Xoá thuộc tính có thể ảnh hưởng đến các giá trị thuộc tính và biến thể sản phẩm đã sử dụng

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Xóa thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": null,
  "meta": {},
  "timestamp": "2025-01-11T06:00:00+07:00"
}
```

### Use-case FE

- Trong bảng list:
  - Nút "Xoá" trên từng row
  - Nên có confirm dialog trước khi xóa
  - Sau khi xoá, FE reload list hoặc loại bỏ item khỏi state

---

## 6. Gợi ý tích hợp FE Admin

- **1. Màn danh sách**
  - Route gợi ý: `/admin/ecommerce/product-attributes`
  - Gọi `GET /api/admin/product-attributes?page=1&limit=20&include_values=true`
  - Chức năng:
    - Filter theo `type`
    - Tìm kiếm theo `name`/`code`
    - Hiển thị số lượng giá trị của mỗi thuộc tính
    - Actions: Sửa, Xoá, (Quản lý giá trị)

- **2. Màn tạo/sửa thuộc tính**
  - Form fields:
    - Name (required)
    - Code (auto-generate từ name nếu không nhập)
    - Type (dropdown: text, select, multiselect, color, image)
    - Description (textarea)
    - Checkboxes: is_required, is_variation, is_filterable, is_visible_on_frontend
    - Sort order (number input)
    - Status (dropdown: active/inactive)
  - Submit:
    - Tạo mới → `POST /api/admin/product-attributes`
    - Cập nhật → `PUT /api/admin/product-attributes/:id`

- **3. Quản lý giá trị thuộc tính**
  - Trong màn chi tiết thuộc tính, có thể:
    - Hiển thị danh sách giá trị (gọi `GET /api/admin/product-attribute-values/attribute/:attributeId`)
    - Thêm giá trị mới (gọi `POST /api/admin/product-attribute-values` với `attribute_id`)
    - Sửa/xóa giá trị (dùng API giá trị thuộc tính)

- **4. Tích hợp với form sản phẩm/biến thể**
  - Khi tạo biến thể sản phẩm:
    - Load danh sách thuộc tính có `is_variation=true`
    - Với mỗi thuộc tính, load danh sách giá trị
    - Cho phép chọn giá trị để tạo biến thể

---

## 7. Lưu ý kỹ thuật

- **ID dạng BigInt**: Tất cả ID trả về dạng string (do BigInt trong Prisma)
- **Code unique**: Mã thuộc tính phải unique, hệ thống tự xử lý duplicate
- **Soft Delete**: Xoá mềm, có thể khôi phục (nếu service hỗ trợ)
- **Validation**:
  - `name` bắt buộc, tối đa 255 ký tự
  - `code` bắt buộc, tối đa 100 ký tự, chỉ chấp nhận chữ thường, số, dấu gạch dưới
  - `type` mặc định `"text"` nếu không truyền
- **Quan hệ**:
  - Một thuộc tính có nhiều giá trị (`values`)
  - Thuộc tính được sử dụng trong biến thể sản phẩm qua bảng `product_variant_attributes`
- **Type và UI**:
  - `text`: Input text
  - `select`: Dropdown/Select (chọn một)
  - `multiselect`: Multi-select (chọn nhiều)
  - `color`: Color picker + hiển thị màu
  - `image`: Image upload/selector

---

## 8. Mô tả chi tiết các trường

### Các trường bắt buộc khi tạo mới
- `name` (string): Tên thuộc tính
- `code` (string): Mã thuộc tính (nếu không truyền sẽ tự động generate từ name)

### Các trường có giá trị mặc định
- `type`: Mặc định `"text"`
- `is_filterable`: Mặc định `true`
- `is_required`: Mặc định `true`
- `is_variation`: Mặc định `false`
- `is_visible_on_frontend`: Mặc định `true`
- `sort_order`: Mặc định `0`
- `status`: Mặc định `"active"`

### Các trường có thể null
- `description`: Có thể null
- `default_value`: Có thể null
- `validation_rules`: Có thể null
- `created_user_id`: Có thể null (tự động lấy từ token nếu có)
- `updated_user_id`: Có thể null (tự động lấy từ token nếu có)
- `deleted_at`: null nếu chưa bị xóa

### Lưu ý về ID
- Tất cả ID trả về dạng `number` (BigInt trong database được convert sang number trong JSON)
- `id` trong response là số nguyên, không phải string

## 9. Enum và Constants

### AttributeType

```typescript
enum AttributeType {
  TEXT = 'text',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  COLOR = 'color',
  IMAGE = 'image'
}
```

### BasicStatus

```typescript
enum BasicStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

## 10. Ví dụ request/response thực tế

### GET /api/admin/product-attributes/2

**Response:**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 2,
    "name": "Dung lượng",
    "code": "capacity",
    "description": null,
    "type": "select",
    "default_value": null,
    "is_filterable": true,
    "is_required": true,
    "is_variation": false,
    "is_visible_on_frontend": true,
    "sort_order": 2,
    "status": "active",
    "validation_rules": null,
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2026-01-28T01:49:33.000Z",
    "updated_at": "2026-01-28T03:23:02.000Z",
    "deleted_at": null,
    "values": [
      {
        "id": 5,
        "product_attribute_id": 2,
        "value": "64",
        "label": "64 GB",
        "color_code": null,
        "sort_order": 0,
        "created_user_id": null,
        "updated_user_id": null,
        "created_at": "2026-01-28T01:49:33.000Z",
        "updated_at": "2026-01-28T01:49:33.000Z",
        "deleted_at": null
      },
      {
        "id": 6,
        "product_attribute_id": 2,
        "value": "128",
        "label": "128 GB",
        "color_code": null,
        "sort_order": 0,
        "created_user_id": null,
        "updated_user_id": null,
        "created_at": "2026-01-28T01:49:33.000Z",
        "updated_at": "2026-01-28T01:49:33.000Z",
        "deleted_at": null
      }
    ]
  },
  "meta": {},
  "timestamp": "2026-01-28T10:23:04+07:00"
}
```

