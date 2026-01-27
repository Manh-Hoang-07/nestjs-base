## Tích hợp API quản lý danh mục sản phẩm (Admin)

- **Mục tiêu**
  - Cho phép admin quản lý cây danh mục sản phẩm (category tree) trong hệ thống.
  - FE Admin có thể: xem danh sách (list), xem tree, lấy root/children, tạo mới, cập nhật, khôi phục, xoá.

## Cấu trúc & bảo mật

- **Base URL**: `http://localhost:3000/api`
- **Prefix module**: `admin/product-categories` (từ `@Controller('admin/product-categories')`)
- **Authentication**: JWT Bearer Token (bắt buộc)
- **Guards**:
  - `JwtAuthGuard`
  - `RbacGuard`
- **Permission bắt buộc**: `product_category.manage`
- **Headers chuẩn**:
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`

---

## 1. Lấy danh sách danh mục (list phẳng, có paging)

### Endpoint

- `GET /api/admin/product-categories`

### Query parameters

- Controller gọi thẳng `productCategoryService.getList(query)`:
  - `page` (optional): số trang (mặc định 1).
  - `limit` (optional): số bản ghi mỗi trang (mặc định 20).
  - `search` (optional): tìm theo tên/slug (tuỳ service implement).
  - `sort` (optional): dạng `field:direction`, ví dụ `name:ASC`.
  - Các filter khác (status, parent_id, ...) nếu `getList` hỗ trợ.

### Response mẫu

**Success (200):**

```json
{
  "items": [
    {
      "id": 1,
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "parent_id": null,
      "status": "active",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

### Use-case FE

- Màn hình: **Danh sách danh mục sản phẩm**:
  - Bảng dạng phẳng, dễ filter & sort.
  - Có thể có cột hiển thị parent name, level, status.

---

## 2. Lấy danh sách đơn giản (simple list)

### Endpoint

- `GET /api/admin/product-categories/simple`

### Hành vi

- Gọi `productCategoryService.getSimpleList(query)`.
  - Thường trả về ít field hơn, dùng cho select/dropdown.

### Use-case FE

- Dùng để load danh mục cha (parent category) trong form tạo/sửa:
  - Dropdown: `Chọn danh mục cha`.

---

## 3. Lấy cây danh mục (tree)

### Endpoint

- `GET /api/admin/product-categories/tree`

### Hành vi

- Gọi `productCategoryService.findTree()`.
  - Trả về cấu trúc cây đầy đủ:

```json
[
  {
    "id": 1,
    "name": "Điện thoại",
    "slug": "dien-thoai",
    "parent_id": null,
    "children": [
      {
        "id": 2,
        "name": "iPhone",
        "slug": "iphone",
        "parent_id": 1
      }
    ]
  }
]
```

### Use-case FE

- Màn "Cây danh mục" (tree view):
  - Hiển thị dạng tree, drag & drop (nếu có), expand/collapse.

---

## 4. Lấy danh sách danh mục root

### Endpoint

- `GET /api/admin/product-categories/root`

### Hành vi

- Gọi `productCategoryService.findRootCategories()`.
  - Trả về các categories có `parent_id = null` (root), có thể kèm `children` (tuỳ implement).

### Use-case FE

- Dùng để:
  - Xây dropdown chỉ các root.
  - Xây màn filter theo nhóm root.

---

## 5. Lấy danh sách con (children) của 1 danh mục

### Endpoint

- `GET /api/admin/product-categories/:id/children`

### Params

- `id`: number – ID danh mục cha.

### Response mẫu

```json
[
  {
    "id": 2,
    "name": "iPhone",
    "slug": "iphone",
    "parent_id": 1,
    "status": "active"
  },
  {
    "id": 3,
    "name": "Samsung",
    "slug": "samsung",
    "parent_id": 1,
    "status": "active"
  }
]
```

### Use-case FE

- Khi click vào 1 node trong tree:
  - FE có thể lazy-load children bằng endpoint này (nếu không tải toàn bộ tree từ đầu).

---

## 6. Lấy chi tiết 1 danh mục theo ID

### Endpoint

- `GET /api/admin/product-categories/:id`

### Params

- `id`: number – ID danh mục.

### Response mẫu

```json
{
  "id": 1,
  "name": "Điện thoại",
  "slug": "dien-thoai",
  "description": "Các loại điện thoại",
  "parent_id": null,
  "status": "active",
  "created_at": "2025-01-11T05:00:00.000Z",
  "updated_at": "2025-01-11T05:00:00.000Z"
}
```

### Use-case FE

- Form **Edit Category**:
  - Khi mở màn sửa, FE gọi endpoint này để lấy dữ liệu ban đầu cho form.

---

## 7. Tạo mới danh mục sản phẩm

### Endpoint

- `POST /api/admin/product-categories`

### Request body (DTO `CreateProductCategoryDto` – gợi ý)

> Xem chi tiết trong `src/modules/ecommerce/product-category/admin/dtos/create-product-category.dto.ts`. Dưới đây là dạng thông dụng:

```json
{
  "name": "Điện thoại",
  "slug": "dien-thoai",
  "description": "Các loại điện thoại",
  "parent_id": null,
  "status": "active"
}
```

- **Fields gợi ý**:
  - `name` (string, required): tên danh mục.
  - `slug` (string, optional): slug, nếu không truyền có thể BE tự generate từ name.
  - `description` (string, optional): mô tả.
  - `parent_id` (number | null, optional): ID danh mục cha, `null` nếu là root.
  - `status` (enum, optional): `active` | `inactive` (tuỳ enum BasicStatus).

### Response

**Success (201 Created):**

```json
{
  "id": 10,
  "name": "Điện thoại",
  "slug": "dien-thoai",
  "parent_id": null,
  "status": "active"
}
```

### Use-case FE

- Màn "Thêm danh mục":
  - Chọn danh mục cha từ `GET /api/admin/product-categories/simple`.
  - Submit form → gọi `POST /api/admin/product-categories`.

---

## 8. Cập nhật danh mục sản phẩm

### Endpoint

- `PUT /api/admin/product-categories/:id`

### Params

- `id`: number – ID danh mục cần cập nhật.

### Request body (DTO `UpdateProductCategoryDto`)

- Các field giống `CreateProductCategoryDto`, **tất cả optional**.

```json
{
  "name": "Điện thoại & Tablet",
  "status": "active"
}
```

### Response

**Success (200):**

```json
{
  "id": 1,
  "name": "Điện thoại & Tablet",
  "slug": "dien-thoai",
  "parent_id": null,
  "status": "active"
}
```

### Use-case FE

- Màn "Sửa danh mục":
  - Cho phép đổi tên, mô tả, parent, status.

---

## 9. Khôi phục (restore) danh mục

### Endpoint

- `PUT /api/admin/product-categories/:id/restore`

### Params

- `id`: number – ID danh mục đã bị xoá mềm (soft delete).

### Response

**Success (200):**

```json
{
  "id": 5,
  "name": "Phụ kiện",
  "slug": "phu-kien",
  "parent_id": null,
  "status": "active",
  "deleted_at": null
}
```

### Use-case FE

- Màn "Thùng rác" hoặc có filter `include_deleted`:
  - Admin có thể khôi phục lại danh mục đã bị xoá.

---

## 10. Xoá danh mục sản phẩm

### Endpoint

- `DELETE /api/admin/product-categories/:id`

### Params

- `id`: number – ID cần xoá.

### Hành vi

- Gọi `productCategoryService.delete(id)`:
  - Thường là **soft delete** (danh dấu `deleted_at`), tuỳ base service.

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
  - Nút "Xoá" trên từng row.
  - Sau khi xoá, FE reload list hoặc loại bỏ item khỏi state.

---

## 11. Gợi ý tích hợp FE Admin

- **1. Màn danh sách**
  - Route gợi ý: `/admin/ecommerce/product-categories`.
  - Gọi `GET /api/admin/product-categories?page=1&limit=20`.
  - Chức năng:
    - Filter theo `status`, `parent_id`.
    - Tìm kiếm theo `name`/`slug`.
    - Actions: Sửa, Xoá, (View tree).

- **2. Màn cây danh mục**
  - Gọi `GET /api/admin/product-categories/tree`.
  - Hiển thị cấu trúc tree, hiển thị tên + số sản phẩm (nếu BE trả).

- **3. Thêm / Sửa**
  - Dùng `simple` list để chọn parent:
    - `GET /api/admin/product-categories/simple`.
  - Submit:
    - Tạo mới → `POST /api/admin/product-categories`.
    - Cập nhật → `PUT /api/admin/product-categories/:id`.

- **4. Khôi phục / Thùng rác**
  - Nếu có UI thùng rác:
    - Dùng `PUT /api/admin/product-categories/:id/restore` để khôi phục.


