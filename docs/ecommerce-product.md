# Tài Liệu Tích Hợp API Ecommerce: Sản Phẩm (Products)

Tài liệu này hướng dẫn chi tiết về việc lấy thông tin, hiển thị và xử lý dữ liệu sản phẩm trong hệ thống Ecommerce.

## 1. Phân Loại Sản Phẩm

Hệ thống hỗ trợ 2 loại sản phẩm chính:
- **Sản phẩm Vật lý (Physical Product)**: Yêu cầu vận chuyển, tính phí ship.
- **Sản phẩm Số (Digital/Asset Product)**: Không cần vận chuyển, được gửi qua email hoặc tải xuống trực tiếp sau khi thanh toán.

### Cách phân biệt:
Trong response API, kiểm tra trường `is_digital`:
- `is_digital: true` -> Sản phẩm số.
- `is_digital: false` -> Sản phẩm vật lý.

## 2. API Danh Sách Sản Phẩm

### Endpoint
`GET /api/public/products`

### Query Parameters
| Tham số | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `page` | Number | 1 | Trang hiện tại |
| `limit` | Number | 10 | Số lượng sản phẩm trên mỗi trang |
| `search` | String | null | Tìm kiếm theo tên sản phẩm |
| `category_slug` | String | null | Slug của danh mục để lọc sản phẩm |
| `category_id` | Number | null | ID của danh mục (nếu có) |
| `sort` | String | null | Sắp xếp (ví dụ: `price:asc`, `created_at:desc`, `view_count:desc`) |
| `min_price` | Number | null | Lọc theo giá thấp nhất |
| `max_price` | Number | null | Lọc theo giá cao nhất |
| `is_featured` | Boolean | null | Lọc sản phẩm nổi bật (`true`/`false`) |
| `status` | String | 'active' | Trạng thái sản phẩm (mặc định chỉ lấy `active`) |

### Response Example
```json
{
  "data": [
    {
      "id": 1,
      "name": "Áo Thun Basic",
      "slug": "ao-thun-basic",
      "price": 150000,
      "sale_price": 120000,
      "image": "https://example.com/ao-thun.jpg",
      "is_digital": false,
      "variants": [...]
    },
    {
      "id": 2,
      "name": "Ebook Lập Trình",
      "slug": "ebook-lap-trinh",
      "price": 50000,
      "is_digital": true,
      "variants": [...]
    }
  ],
  "meta": {
    "page": 1,
    "total": 20,
    "totalPages": 2
  }
}
```

## 3. API Chi Tiết Sản Phẩm

### Endpoint
`GET /api/public/products/:slug`

### Response Data
Thông tin chi tiết bao gồm:
- `id`, `name`, `sku`, `description`, `content`.
- `gallery`: Danh sách ảnh chi tiết.
- `variants`: Danh sách các biến thể (Màu sắc, kích thước, phiên bản...).
- `reviews`: Đánh giá của khách hàng.
- `related_products`: Các sản phẩm liên quan.

## 4. Xử Lý Biến Thể (Variants)

Mọi sản phẩm trong hệ thống đều có ít nhất 1 biến thể (Variant).
- Đối với sản phẩm đơn giản (Simple Product): Hệ thống tự tạo 1 biến thể mặc định (thường có tên `Default` hoặc trùng tên sản phẩm).
- Đối với sản phẩm có nhiều thuộc tính (Variable Product): Có nhiều biến thể (VD: Size S - Màu Đỏ, Size M - Màu Xanh).

### Logic Frontend:
1. Khi user chọn sản phẩm, frontend cần hiển thị các thuộc tính (Attributes) nếu có.
2. User phải chọn đầy đủ các thuộc tính để xác định được một `product_variant_id` cụ thể.
3. Giá (`price`, `sale_price`) và tồn kho (`stock_quantity`) nằm ở cấp độ **Variant**, không phải Product cha. Frontend cần hiển thị giá của Variant đang chọn.

### API Lấy Variants Của Sản Phẩm
`GET /api/public/products/:id/variants`

Trả về danh sách tất cả variants của sản phẩm để frontend xử lý việc chọn thuộc tính.

```json
[
  {
    "id": 101,
    "name": "Màu Đỏ - Size S",
    "sku": "AO-DO-S",
    "price": 150000,
    "stock_quantity": 50,
    "attributes": [
      { "name": "Màu sắc", "value": "Đỏ" },
      { "name": "Kích thước", "value": "S" }
    ]
  },
  ...
]
```

## 5. Sản Phẩm Số (Digital Products)

Đối với sản phẩm có `is_digital: true`:
- Không cần chọn địa chỉ giao hàng khi checkout (hoặc địa chỉ chỉ dùng cho billing).
- Không áp dụng phương thức thanh toán **COD** (Cash on Delivery).
- Sau khi thanh toán thành công, hệ thống sẽ gửi email chứa link tải hoặc hiển thị nút Download trong trang chi tiết đơn hàng.
- Logic thêm vào giỏ hàng và thanh toán tương tự sản phẩm vật lý, nhưng cần lưu ý validation ở bước chọn phương thức thanh toán.
