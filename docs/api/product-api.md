# Tích hợp API quản lý Sản phẩm (Admin)

- **Mục tiêu**
  - Cho phép admin quản lý sản phẩm (Products) trong hệ thống.
  - FE Admin có thể: xem danh sách, xem chi tiết, tạo mới, cập nhật, xoá.

## Cấu trúc & bảo mật

- **Base URL**: `http://localhost:3000/api`
- **Prefix module**: `admin/products` (từ `@Controller('admin/products')`)
- **Authentication**: JWT Bearer Token (bắt buộc)
- **Guards**:
  - `JwtAuthGuard`
  - `RbacGuard`
- **Permission bắt buộc**: `product.manage`
- **Headers chuẩn**:
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`

---

## 1. Lấy danh sách sản phẩm (có phân trang)

### Endpoint

- `GET /api/admin/products`

### Query parameters

- `page` (optional): số trang (mặc định 1)
- `limit` (optional): số bản ghi mỗi trang (mặc định 20)
- `search` (optional): tìm kiếm theo name/sku/slug
- `status` (optional): lọc theo trạng thái (`active`, `inactive`, `draft`, `archived`)
- `is_featured` (optional, boolean): lọc sản phẩm nổi bật
- `is_variable` (optional, boolean): lọc sản phẩm có biến thể
- `is_digital` (optional, boolean): lọc sản phẩm số
- `category_id` (optional): lọc theo danh mục
- `group_id` (optional): lọc theo nhóm (multi-tenant)
- `include_deleted` (optional, boolean): bao gồm các bản ghi đã xóa
- `sort` (optional): sắp xếp dạng `field:direction`, ví dụ `name:ASC`, `created_at:DESC`

### Response mẫu

**Success (200):**

```json
{
  "data": [
    {
      "id": "1",
      "name": "Áo thun nam",
      "slug": "ao-thun-nam",
      "sku": "ATN001",
      "description": "Áo thun nam chất lượng cao",
      "short_description": "Áo thun nam",
      "min_stock_level": 10,
      "image": "https://example.com/images/ao-thun.jpg",
      "gallery": [
        "https://example.com/images/ao-thun-1.jpg",
        "https://example.com/images/ao-thun-2.jpg"
      ],
      "status": "active",
      "is_featured": true,
      "is_variable": true,
      "is_digital": false,
      "download_limit": null,
      "meta_title": "Áo thun nam - Shop",
      "meta_description": "Mô tả SEO",
      "canonical_url": "https://example.com/ao-thun-nam",
      "og_title": "Áo thun nam",
      "og_description": "Áo thun nam chất lượng cao",
      "og_image": "https://example.com/images/og-ao-thun.jpg",
      "group_id": null,
      "created_user_id": "1",
      "updated_user_id": "1",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "deleted_at": null,
      "categories": [
        {
          "id": "1",
          "name": "Áo thun",
          "slug": "ao-thun"
        }
      ],
      "variants": [
        {
          "id": "1",
          "name": "Áo thun nam - Đỏ - M",
          "sku": "ATN001-RED-M",
          "price": "299000",
          "sale_price": "249000",
          "stock_quantity": 50
        }
      ]
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemCount": 10,
    "itemsPerPage": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextPage": 2,
    "previousPage": null
  }
}
```

### Use-case FE

- Màn hình: **Danh sách sản phẩm**
  - Bảng hiển thị các sản phẩm, có thể filter theo status, category, featured
  - Có thể tìm kiếm theo tên, SKU
  - Có thể sắp xếp theo tên, ngày tạo, giá
  - Hiển thị số lượng biến thể, tổng tồn kho

---

## 2. Lấy chi tiết một sản phẩm theo ID

### Endpoint

- `GET /api/admin/products/:id`

### Params

- `id`: string | number – ID sản phẩm

### Response mẫu

**Success (200):**

```json
{
  "id": "1",
  "name": "Áo thun nam",
  "slug": "ao-thun-nam",
  "sku": "ATN001",
  "description": "Áo thun nam chất lượng cao, 100% cotton",
  "short_description": "Áo thun nam",
  "min_stock_level": 10,
  "image": "https://example.com/images/ao-thun.jpg",
  "gallery": [
    "https://example.com/images/ao-thun-1.jpg",
    "https://example.com/images/ao-thun-2.jpg"
  ],
  "status": "active",
  "is_featured": true,
  "is_variable": true,
  "is_digital": false,
  "download_limit": null,
  "meta_title": "Áo thun nam - Shop",
  "meta_description": "Mô tả SEO cho sản phẩm",
  "canonical_url": "https://example.com/ao-thun-nam",
  "og_title": "Áo thun nam",
  "og_description": "Áo thun nam chất lượng cao",
  "og_image": "https://example.com/images/og-ao-thun.jpg",
  "group_id": null,
  "created_user_id": "1",
  "updated_user_id": "1",
  "created_at": "2025-01-11T05:00:00.000Z",
  "updated_at": "2025-01-11T05:00:00.000Z",
  "deleted_at": null,
  "categories": [
    {
      "id": "1",
      "name": "Áo thun",
      "slug": "ao-thun"
    },
    {
      "id": "2",
      "name": "Nam",
      "slug": "nam"
    }
  ],
  "variants": [
    {
      "id": "1",
      "name": "Áo thun nam - Đỏ - M",
      "sku": "ATN001-RED-M",
      "price": "299000",
      "sale_price": "249000",
      "stock_quantity": 50,
      "is_active": true
    },
    {
      "id": "2",
      "name": "Áo thun nam - Đỏ - L",
      "sku": "ATN001-RED-L",
      "price": "299000",
      "sale_price": "249000",
      "stock_quantity": 30,
      "is_active": true
    }
  ]
}
```

### Use-case FE

- Form **Edit Sản phẩm**
  - Khi mở màn sửa, FE gọi endpoint này để lấy dữ liệu ban đầu cho form
  - Hiển thị đầy đủ thông tin sản phẩm, danh mục, biến thể

---

## 3. Tạo mới sản phẩm

### Endpoint

- `POST /api/admin/products`

### Request body (DTO `CreateProductDto`)

```json
{
  "name": "Áo thun nam",
  "slug": "ao-thun-nam",
  "sku": "ATN001",
  "description": "Áo thun nam chất lượng cao, 100% cotton",
  "short_description": "Áo thun nam",
  "min_stock_level": 10,
  "image": "https://example.com/images/ao-thun.jpg",
  "gallery": [
    "https://example.com/images/ao-thun-1.jpg",
    "https://example.com/images/ao-thun-2.jpg"
  ],
  "status": "active",
  "category_ids": ["1", "2"],
  "is_featured": true,
  "is_variable": true,
  "is_digital": false,
  "download_limit": null,
  "meta_title": "Áo thun nam - Shop",
  "meta_description": "Mô tả SEO cho sản phẩm",
  "canonical_url": "https://example.com/ao-thun-nam",
  "og_title": "Áo thun nam",
  "og_description": "Áo thun nam chất lượng cao",
  "og_image": "https://example.com/images/og-ao-thun.jpg"
}
```

**Fields:**

- `name` (string, **required**): Tên sản phẩm (3-255 ký tự, chỉ chấp nhận chữ, số, khoảng trắng, dấu gạch ngang/gạch dưới)
- `slug` (string, optional): URL slug (3-255 ký tự, chỉ chữ thường, số, dấu gạch ngang). Nếu không truyền sẽ tự động generate từ name
- `sku` (string, **required**): Mã SKU (3-100 ký tự, unique, chỉ chữ, số, dấu gạch ngang/gạch dưới)
- `description` (string, optional): Mô tả chi tiết (tối đa 10000 ký tự)
- `short_description` (string, optional): Mô tả ngắn (tối đa 500 ký tự)
- `min_stock_level` (number, optional): Mức tồn kho tối thiểu (0-9999), mặc định 0
- `image` (string, optional): URL hình ảnh chính (phải là URL hợp lệ, tối đa 500 ký tự)
- `gallery` (array, optional): Mảng URL hình ảnh gallery (JSON)
- `status` (enum, optional): Trạng thái sản phẩm (`active`, `inactive`, `draft`, `archived`), mặc định `active`
- `category_ids` (array of strings, optional): Mảng ID danh mục sản phẩm
- `is_featured` (boolean, optional): Sản phẩm nổi bật, mặc định `false`
- `is_variable` (boolean, optional): Sản phẩm có biến thể, mặc định `true`
- `is_digital` (boolean, optional): Sản phẩm số, mặc định `false`
- `download_limit` (number, optional): Giới hạn số lần tải xuống (0-1000), chỉ dùng cho sản phẩm số
- `meta_title` (string, optional): Tiêu đề SEO (tối đa 255 ký tự)
- `meta_description` (string, optional): Mô tả SEO (tối đa 500 ký tự)
- `canonical_url` (string, optional): Canonical URL (phải là URL hợp lệ, tối đa 500 ký tự)
- `og_title` (string, optional): Open Graph title (tối đa 255 ký tự)
- `og_description` (string, optional): Open Graph description (tối đa 500 ký tự)
- `og_image` (string, optional): Open Graph image URL (phải là URL hợp lệ, tối đa 500 ký tự)

**Lưu ý:**
- Nếu không truyền `slug`, hệ thống sẽ tự động generate từ `name` (toSlug)
- Nếu `slug` đã tồn tại, hệ thống sẽ tự động thêm timestamp vào cuối
- `category_ids` sẽ được xử lý sau khi tạo sản phẩm (many-to-many relationship)
- `group_id` sẽ tự động lấy từ context nếu có (multi-tenant)

### Response

**Success (201 Created):**

```json
{
  "id": "10",
  "name": "Áo thun nam",
  "slug": "ao-thun-nam",
  "sku": "ATN001",
  "status": "active",
  "is_featured": true,
  "is_variable": true,
  "created_at": "2025-01-11T05:00:00.000Z",
  "updated_at": "2025-01-11T05:00:00.000Z"
}
```

### Use-case FE

- Màn "Thêm sản phẩm"
  - Form nhiều tab/section:
    - **Thông tin cơ bản**: name, slug, sku, description, short_description
    - **Hình ảnh**: image, gallery
    - **Danh mục**: chọn từ `GET /api/admin/product-categories/simple` hoặc tree
    - **Tồn kho**: min_stock_level
    - **Cài đặt**: status, is_featured, is_variable, is_digital, download_limit
    - **SEO**: meta_title, meta_description, canonical_url, og_*
  - Submit form → gọi `POST /api/admin/products`
  - Sau khi tạo, có thể thêm biến thể sản phẩm qua API `POST /api/admin/product-variants`

---

## 4. Cập nhật sản phẩm

### Endpoint

- `PUT /api/admin/products/:id`

### Params

- `id`: string | number – ID sản phẩm cần cập nhật

### Request body (DTO `UpdateProductDto`)

- Tất cả các field **optional**, chỉ gửi các field cần cập nhật

```json
{
  "name": "Áo thun nam cao cấp",
  "description": "Áo thun nam chất lượng cao, 100% cotton, nhập khẩu",
  "status": "active",
  "is_featured": false,
  "category_ids": ["1", "3"]
}
```

**Fields:**

- Tất cả các field giống `CreateProductDto`, nhưng tất cả đều optional
- `updated_user_id` (number, optional): ID người cập nhật (tự động lấy từ token)

**Lưu ý:**
- Nếu thay đổi `name` và không truyền `slug`, hệ thống sẽ tự động generate slug mới
- Nếu thay đổi `slug` và slug mới đã tồn tại (khác ID hiện tại), hệ thống sẽ tự động thêm timestamp
- `category_ids` sẽ được sync (xóa các liên kết cũ, tạo mới)
- Hệ thống sẽ verify ownership (group_id) trước khi cho phép cập nhật

### Response

**Success (200):**

```json
{
  "id": "1",
  "name": "Áo thun nam cao cấp",
  "slug": "ao-thun-nam",
  "sku": "ATN001",
  "description": "Áo thun nam chất lượng cao, 100% cotton, nhập khẩu",
  "status": "active",
  "is_featured": false,
  "updated_at": "2025-01-11T06:00:00.000Z"
}
```

### Use-case FE

- Màn "Sửa sản phẩm"
  - Cho phép cập nhật tất cả các field
  - Có thể thay đổi danh mục (sync)
  - Lưu ý: Thay đổi một số field có thể ảnh hưởng đến biến thể hoặc đơn hàng

---

## 5. Xoá sản phẩm

### Endpoint

- `DELETE /api/admin/products/:id`

### Params

- `id`: string | number – ID cần xoá

### Hành vi

- Gọi `productService.delete(id)`:
  - Thường là **soft delete** (đánh dấu `deleted_at`), tuỳ base service
  - Hệ thống sẽ verify ownership (group_id) trước khi cho phép xóa
  - **Lưu ý**: Xoá sản phẩm có thể ảnh hưởng đến:
    - Các biến thể sản phẩm (cascade delete)
    - Các đơn hàng đã có sản phẩm này (nên không cho xóa nếu đã có đơn hàng)
    - Giỏ hàng có chứa sản phẩm

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
  - Nên có confirm dialog trước khi xóa
  - Kiểm tra xem sản phẩm có đơn hàng/biến thể không trước khi cho phép xóa
  - Sau khi xoá, FE reload list hoặc loại bỏ item khỏi state

---

## 6. Gợi ý tích hợp FE Admin

- **1. Màn danh sách**
  - Route gợi ý: `/admin/ecommerce/products`
  - Gọi `GET /api/admin/products?page=1&limit=20`
  - Chức năng:
    - Filter theo `status`, `category_id`, `is_featured`, `is_variable`
    - Tìm kiếm theo `name`/`sku`/`slug`
    - Hiển thị: hình ảnh, tên, SKU, giá (từ variant), tồn kho, trạng thái
    - Actions: Xem, Sửa, Xoá, (Sao chép)
    - Có thể bulk actions: xóa nhiều, đổi status nhiều

- **2. Màn tạo/sửa sản phẩm**
  - Form nhiều tab:
    - **Tab 1: Thông tin cơ bản**
      - Name (required)
      - Slug (auto-generate từ name)
      - SKU (required, unique)
      - Short description (textarea)
      - Description (rich text editor)
    - **Tab 2: Hình ảnh**
      - Image chính (upload hoặc URL)
      - Gallery (multiple upload hoặc URLs)
    - **Tab 3: Danh mục**
      - Chọn từ tree/category selector
      - Có thể chọn nhiều danh mục
    - **Tab 4: Tồn kho & Cài đặt**
      - Min stock level
      - Status (dropdown)
      - Checkboxes: is_featured, is_variable, is_digital
      - Download limit (nếu is_digital = true)
    - **Tab 5: SEO**
      - Meta title, meta description
      - Canonical URL
      - OG tags (title, description, image)
  - Submit:
    - Tạo mới → `POST /api/admin/products`
    - Cập nhật → `PUT /api/admin/products/:id`

- **3. Quản lý biến thể sản phẩm**
  - Trong màn chi tiết sản phẩm, có tab "Biến thể":
    - Hiển thị danh sách biến thể (gọi `GET /api/admin/product-variants?product_id=:id`)
    - Thêm biến thể mới (gọi `POST /api/admin/product-variants`)
    - Sửa/xóa biến thể (dùng API product-variants)

- **4. Tích hợp với thuộc tính**
  - Khi tạo biến thể:
    - Load danh sách thuộc tính có `is_variation=true`
    - Với mỗi thuộc tính, load danh sách giá trị
    - Cho phép chọn giá trị để tạo biến thể

---

## 7. Lưu ý kỹ thuật

- **ID dạng BigInt**: Tất cả ID trả về dạng string (do BigInt trong Prisma)
- **Slug unique**: URL slug phải unique, hệ thống tự xử lý duplicate
- **SKU unique**: Mã SKU phải unique trong toàn hệ thống
- **Soft Delete**: Xoá mềm, có thể khôi phục (nếu service hỗ trợ)
- **Multi-tenant**: Hệ thống hỗ trợ multi-tenant qua `group_id`, tự động filter theo context
- **Validation**:
  - `name`: bắt buộc, 3-255 ký tự, chỉ chữ, số, khoảng trắng, dấu gạch
  - `slug`: 3-255 ký tự, chỉ chữ thường, số, dấu gạch ngang
  - `sku`: bắt buộc, 3-100 ký tự, unique, chỉ chữ, số, dấu gạch
  - `image`, `canonical_url`, `og_image`: phải là URL hợp lệ
- **Quan hệ**:
  - Một sản phẩm có nhiều danh mục (many-to-many qua `product_category`)
  - Một sản phẩm có nhiều biến thể (`variants`)
  - Một sản phẩm có nhiều đánh giá (`reviews`)
  - Một sản phẩm có thể có trong nhiều giỏ hàng (`carts`)
- **Gallery**: Lưu dạng JSON array, có thể là array rỗng hoặc array URLs

---

## 8. Enum và Constants

### ProductStatus

```typescript
enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}
```

---

## 9. Workflow đề xuất

### Tạo sản phẩm mới

1. **Tạo sản phẩm chính**
   - Gọi `POST /api/admin/products` với thông tin cơ bản
   - Nhận về `product.id`

2. **Gán danh mục** (nếu chưa gán trong bước 1)
   - Gọi `PUT /api/admin/products/:id` với `category_ids`

3. **Tạo biến thể** (nếu `is_variable = true`)
   - Load danh sách thuộc tính: `GET /api/admin/product-attributes?is_variation=true`
   - Với mỗi thuộc tính, load giá trị: `GET /api/admin/product-attribute-values/attribute/:attributeId`
   - Tạo biến thể: `POST /api/admin/product-variants` với `product_id` và các giá trị thuộc tính

4. **Cập nhật SEO** (nếu chưa điền trong bước 1)
   - Gọi `PUT /api/admin/products/:id` với các field SEO

### Cập nhật sản phẩm

1. **Cập nhật thông tin cơ bản**
   - Gọi `PUT /api/admin/products/:id` với các field cần cập nhật

2. **Quản lý biến thể**
   - Xem danh sách: `GET /api/admin/product-variants?product_id=:id`
   - Thêm/sửa/xóa biến thể qua API product-variants

3. **Quản lý danh mục**
   - Cập nhật `category_ids` trong `PUT /api/admin/products/:id`

