# Tài Liệu Tích Hợp API Ecommerce

Tài liệu này hướng dẫn tích hợp luồng ecommerce cho ứng dụng, bao gồm: Sản phẩm, Danh mục, Giỏ hàng, Đặt hàng, Thanh toán và Đơn hàng.
Hệ thống hỗ trợ cả **Sản phẩm vật lý** (Physical) và **Sản phẩm số** (Digital/Asset).

## 1. Tổng Quan

- **Authentication**: Các API public thường không yêu cầu login cứng nhưng hỗ trợ header `Authorization: Bearer <token>` để nhận diện user. Nếu không có token, hệ thống xử lý như Guest.
- **Guest Cart**: Sử dụng `cart_uuid` (tự generate ở client, lưu localStorage) để định danh giỏ hàng cho khách vãng lai.

## 2. Sản Phẩm (Products)

### Lấy danh sách sản phẩm
- **Endpoint**: `GET /api/public/products`
- **Query Params**:
  - `page`: Trang hiện tại (default: 1)
  - `limit`: Số lượng item/trang (default: 10)
  - `search`: Tìm kiếm theo tên
  - `category_slug`: Slug của danh mục để lọc
  - `sort`: Sắp xếp (ví dụ: `price:asc`, `created_at:desc`)
  - `min_price`, `max_price`: Lọc theo khoảng giá
- **Digital Product**: Kiểm tra trường `is_digital: true` trong response để phân biệt sản phẩm số.

### Chi tiết sản phẩm
- **Endpoint**: `GET /api/public/products/:slug`
- **Response**: Trả về thông tin chi tiết, bao gồm `variants` (biến thể), `gallery` (ảnh), và thông tin `is_digital`.

### Sản phẩm theo danh mục
- **Endpoint**: `GET /api/public/products/category/:slug`

## 3. Danh Mục Sản Phẩm (Categories)

### Lấy cây danh mục (Menu)
- **Endpoint**: `GET /api/public/product-categories/tree`
- **Mô tả**: Trả về danh sách danh mục phân cấp cha-con, dùng để render menu hoặc bộ lọc.

### Chi tiết danh mục
- **Endpoint**: `GET /api/public/product-categories/:slug`

## 4. Giỏ Hàng (Cart)

Quy trình: Client generate một UUID (ví dụ `uuidv4()`) lần đầu user vào trang và lưu `cart_uuid` này. Luôn gửi kèm `cart_uuid` trong các request giỏ hàng.

### Lấy thông tin giỏ hàng
- **Endpoint**: `GET /api/public/cart`
- **Query**: `cart_uuid=<UUID>`

### Thêm vào giỏ
- **Endpoint**: `POST /api/public/cart/add`
- **Body**:
  ```json
  {
    "cart_uuid": "UUID-...",
    "product_variant_id": 123,
    "quantity": 1
  }
  ```

### Cập nhật số lượng
- **Endpoint**: `PUT /api/public/cart/update`
- **Body**: `cart_item_id`, `quantity`, `cart_uuid`

### Xóa sản phẩm
- **Endpoint**: `DELETE /api/public/cart/item/:id?cart_uuid=...`

## 5. Phương Thức Vận Chuyển (Shipping Methods)

### Lấy danh sách vận chuyển
- **Endpoint**: `GET /api/public/shipping-methods/active`
- **Mô tả**: Trả về các phương thức vận chuyển khả dụng.
- **Lưu ý**: Đơn hàng Digital vẫn yêu cầu chọn một phương thức (có thể cấu hình phương thức "Email Delivery" giá 0đ).

### Tính phí vận chuyển (Ước tính)
- **Endpoint**: `POST /api/public/shipping-methods/calculate`
- **Body**: `{ "shipping_method_id": 1, "destination": "...", ... }`

## 6. Đặt Hàng (Checkout)

Trước khi đặt hàng, client cần có:
1. `shipping_method_id`: ID phương thức vận chuyển.
2. `payment_method_id`: ID phương thức thanh toán.

### Logic Thanh Toán & Loại Đơn Hàng
- **Payment Methods**:
  - Offline: `COD` (Thanh toán khi nhận hàng), `BANK_TRANSFER`.
  - Online: `VNPAY`.
- **Validation**:
  - Nếu đơn hàng chứa sản phẩm số (`is_digital = true`), hệ thống **TỪ CHỐI** phương thức `COD`.

### API Tạo Đơn Hàng
- **Endpoint**: `POST /api/public/orders`
- **Body**:
  ```json
  {
    "cart_uuid": "UUID-...",
    "customer_name": "Nguyen Van A",
    "customer_email": "a@test.com",
    "customer_phone": "0987...",
    "shipping_address": { ... }, // Json object địa chỉ
    "billing_address": { ... },  // Optional, default lấy shipping
    "shipping_method_id": 1,
    "payment_method_id": 2,      // ID của method
    "notes": "Ghi chú..."
  }
  ```
- **Response Success**:
  ```json
  {
    "order_id": 100,
    "order_number": "ORD-...",
    "status": "pending",
    "total_amount": 500000,
    "access_url": "..." // Link tra cứu đơn hàng không cần login
  }
  ```

## 7. Thanh Toán (Payment Processing)

Sau khi có `order_id` từ bước trên:

### Trường hợp 1: Offline (COD / Bank Transfer)
- Đơn hàng đã được tạo thành công với trạng thái `pending`.
- Hiển thị thông tin chuyển khoản (nếu là Bank Transfer) hoặc lời cảm ơn (COD).

### Trường hợp 2: Online Payment (VNPay...)
- Sử dụng API Payment để lấy link thanh toán.
- **Endpoint**: `POST /api/payment/create-url`
- **Body**:
  ```json
  {
    "order_id": 100, // Lấy từ response tạo đơn
    "payment_method_code": "vnpay", // Code phương thức
    "customer_email": "...",
    "customer_phone": "..." // Optional
  }
  ```
- **Response**: Trả về URL. Client redirect user sang URL này để thanh toán.
- **Callback**: Sau khi thanh toán, cổng thanh toán redirect về trang kết quả (vd: `/payment/success` hoặc `/payment/failed` được cấu hình trong backend).

## 8. Tra Cứu Đơn Hàng & Sản Phẩm Số

### Lấy danh sách đơn hàng (User đã login)
- **Endpoint**: `GET /api/public/orders`

### Chi tiết đơn hàng (User đã login)
- **Endpoint**: `GET /api/public/orders/:id`

### Tra cứu đơn hàng (User chưa login / Guest)
- **Endpoint**: `GET /api/public/orders/access`
- **Query**: `orderCode=ORD-...&hashKey=...` (Lấy từ response khi tạo đơn hoặc email gửi về).

### Đơn Hàng Sản Phẩm Số (Digital Assets)
- Khi gọi chi tiết đơn hàng (API `:id` hoặc `access`), nếu đơn hàng đã thanh toán thành công:
- Hệ thống sẽ trả về danh sách `items` kèm theo `digital_assets`.
- Nội dung asset (`content`) sẽ được server **tự động giải mã** (decrypt) trước khi trả về. Client chỉ việc hiển thị (ví dụ: License Key, Link Download).
