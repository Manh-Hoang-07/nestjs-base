# Tài liệu Tích hợp API Khuyến mãi & Đơn hàng

Tài liệu này cung cấp chi tiết các endpoint API để tích hợp tính năng Khuyến mãi (Coupons) và Đơn hàng (Orders) cho phía Front-end.

---

## 1. Khuyến mãi & Mã giảm giá (Promotions / Coupons)

Base URL: `/api/public/discounts`

### 1.1. Lấy danh sách mã giảm giá khả dụng
Lấy tất cả các mã giảm giá đang hoạt động và có thể sử dụng.

- **URL:** `/coupons/available`
- **Method:** `GET`
- **Authentication:** Tùy chọn (Nếu có Token sẽ kiểm tra được giới hạn sử dụng theo User)

**Phản hồi thành công (200):**
```json
{
  "message": "Lấy danh sách mã giảm giá thành công",
  "data": [
    {
      "id": 1,
      "code": "SUMMER2024",
      "name": "Giảm giá mùa hè",
      "description": "Giảm 10% cho đơn hàng từ 500k",
      "discount_type": "percentage", // percentage, fixed_amount, free_shipping
      "discount_value": 10,
      "minimum_order_amount": 500000,
      "maximum_discount_amount": 100000,
      "usage_limit": 100,
      "usage_count": 10,
      "start_date": "2024-06-01T00:00:00.000Z",
      "end_date": "2024-08-31T23:59:59.000Z",
      "is_active": true
    }
  ]
}
```

### 1.2. Kiểm tra mã giảm giá (Validate)
Dùng để kiểm tra nhanh xem mã có hợp lệ không và tính toán số tiền giảm giá dự kiến mà chưa cần áp dụng vào giỏ hàng.

- **URL:** `/validate-coupon`
- **Method:** `POST`
- **Body:**
```json
{
  "coupon_code": "SUMMER2024",
  "cart_total": 600000 // Tổng giá trị đơn hàng hiện tại
}
```

**Phản hồi thành công (201):**
```json
{
  "message": "Mã giảm giá hợp lệ",
  "data": {
    "id": 1,
    "code": "SUMMER2024",
    "name": "Giảm giá mùa hè",
    "description": "Giảm 10% cho đơn hàng từ 500k",
    "discount_type": "percentage",
    "discount_value": 10,
    "minimum_order_amount": 500000,
    "maximum_discount_amount": 100000,
    "is_valid": true,
    "estimated_discount": 60000,
    "final_amount": 540000
  }
}
```

### 1.3. Áp dụng mã giảm giá vào giỏ hàng
Thực hiện gắn mã giảm giá vào giỏ hàng. API này sẽ cập nhật lại giá trị `discount_amount` và `total_amount` của giỏ hàng (Cart Header).

- **URL:** `/apply-coupon`
- **Method:** `POST`
- **Authentication:** Required (JwtAuthGuard)
- **Body:**
```json
{
  "cart_id": 12,        // ID của giỏ hàng (nếu có)
  "cart_uuid": "...",   // Hoặc UUID của giỏ hàng (thường dùng cho khách chưa login)
  "coupon_code": "SUMMER2024"
}
```

**Phản hồi thành công (201):** Trả về thông tin giỏ hàng đã cập nhật số tiền và danh sách item.

### 1.4. Xóa mã giảm giá khỏi giỏ hàng
Hủy việc sử dụng mã giảm giá cho giỏ hàng.

- **URL:** `/remove-coupon/:cart_id`
- **Method:** `DELETE`
- **Authentication:** Required

---

## 2. Đơn hàng (Orders)

Base URL: `/api/public/orders`

### 2.1. Tạo đơn hàng (Checkout)
Chuyển đổi giỏ hàng thành đơn hàng chính thức.

- **URL:** `/`
- **Method:** `POST`
- **Authentication:** Required/Optional
- **Body:** (CreateOrderDto)
```json
{
  "customer_name": "Nguyên Văn A",
  "customer_email": "vana@example.com",
  "customer_phone": "0987654321",
  "shipping_address": {
    "name": "Nguyễn Văn A",
    "phone": "0987654321",
    "address": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP.HCM"
  },
  "billing_address": {}, // Tùy chọn
  "shipping_method_id": 1,
  "payment_method_id": 2, 
  "notes": "Giao giờ hành chính",
  "cart_uuid": "abc-123-xyz" // UUID của giỏ hàng cần thanh toán
}
```

**Phản hồi thành công (201):**
```json
{
  "order_id": 101,
  "order_number": "ORD-20240129-001",
  "status": "pending",
  "total_amount": 540000,
  "items_count": 3,
  "access_url": "http://domain.com/orders/access?orderCode=ORD...&hashKey=..."
}
```

### 2.2. Danh sách đơn hàng của tôi
Lấy lịch sử mua hàng của User.

- **URL:** `/`
- **Method:** `GET`
- **Query Params:**
  - `page`: Trang hiện tại (mặc định 1)
  - `limit`: Số bản ghi/trang (mặc định 10)
  - `status`: Lọc theo trạng thái (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`)

### 2.3. Chi tiết đơn hàng
- **URL:** `/:id`
- **Method:** `GET`

### 2.4. Tra cứu đơn hàng (Khách vãng lai)
Sử dụng mã đơn hàng và mã bảo mật (hashKey) nhận được sau khi đặt hàng hoặc qua email.

- **URL:** `/access`
- **Method:** `GET`
- **Query Params:**
  - `orderCode`: Mã đơn hàng
  - `hashKey`: Chuỗi bảo mật đi kèm

### 2.5. Hủy đơn hàng
Chỉ áp dụng khi đơn hàng ở trạng thái `pending` hoặc `confirmed`.

- **URL:** `/:id/cancel`
- **Method:** `PUT`

---

## 3. Các thông tin bổ trợ

### 3.1. Danh sách phương thức giao hàng
Dùng để lấy ID cho trường `shipping_method_id`.
- **URL:** `/api/public/shipping-methods/active`
- **Method:** `GET`

### 3.2. Tính phí vận chuyển (Ước tính)
- **URL:** `/api/public/shipping-methods/calculate`
- **Method:** `POST`
- **Body:** `{ "shipping_method_id": 1, "cart_value": 500000, "weight": 500, "destination": { "city": "TP.HCM" } }`

### 3.3. Trạng thái đơn hàng (Order Status)

| Trạng thái | Mô tả |
| :--- | :--- |
| `pending` | Đang chờ xử lý / Chờ thanh toán |
| `confirmed` | Đã xác nhận |
| `processing` | Đang xử lý sản phẩm |
| `shipped` | Đang giao hàng |
| `delivered` | Đã giao thành công |
| `cancelled` | Đã hủy đơn |
