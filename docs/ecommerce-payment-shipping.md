# Tài Liệu Tích Hợp API Ecommerce: Thanh Toán & Vận Chuyển

Tài liệu này mô tả các API liên quan đến phương thức thanh toán và vận chuyển, phục vụ cho trang Checkout.

## 1. Phương Thức Thanh Toán (Payment Methods)

Client cần lấy danh sách phương thức thanh toán khả dụng để hiển thị cho User chọn.

### Lấy danh sách phương thức thanh toán
**Endpoint**: `GET /api/public/payment-methods` (hoặc endpoint tương tự trong `payment-method` module)
**Mô tả**: Trả về danh sách các phương thức như COD, VNPay, ZaloPay, Bank Transfer.

### Response Example
```json
[
  {
    "id": 1,
    "code": "cod",
    "name": "Thanh toán khi nhận hàng (COD)",
    "description": "Thanh toán tiền mặt cho shipper khi nhận hàng",
    "type": "offline",
    "is_active": true
  },
  {
    "id": 2,
    "code": "vnpay",
    "name": "Thanh toán qua VNPay",
    "description": "Thẻ ATM/Visa/MasterCard/QR Code",
    "type": "online",
    "is_active": true
  }
]
```

### Lưu ý quan trọng về Sản Phẩm Số:
- Nếu trong giỏ hàng có **bất kỳ** sản phẩm nào là **Sản phẩm số (`is_digital: true`)**, Client **KHÔNG ĐƯỢC** cho phép chọn phương thức **COD**.
- Backend cũng sẽ validate và trả về lỗi nếu User cố tình chọn COD cho đơn hàng Digital.
- Với đơn hàng Digital, bắt buộc thanh toán Online (VNPay, Bank Transfer...) để hệ thống có thể tự động gửi hàng ngay lập tức.

## 2. Phương Thức Vận Chuyển (Shipping Methods)

Dùng cho sản phẩm vật lý. Nếu đơn hàng toàn sản phẩm số, bước này có thể bỏ qua hoặc chọn một phương thức mặc định "Email Delivery" (giá 0đ).

### Lấy danh sách vận chuyển khả dụng
**Endpoint**: `GET /api/public/shipping-methods/active`

### Response Example
```json
[
  {
    "id": 1,
    "code": "standard",
    "name": "Giao hàng tiêu chuẩn",
    "price": 30000, // Giá cơ bản
    "description": "3-5 ngày làm việc"
  },
  {
    "id": 2,
    "code": "express",
    "name": "Giao hàng hỏa tốc",
    "price": 50000,
    "description": "1-2 ngày làm việc"
  }
]
```

### Tính Phí Vận Chuyển (Calculate Shipping Fee)
Giá vận chuyển có thể thay đổi tùy thuộc vào giá trị đơn hàng, cân nặng hoặc địa chỉ. Sử dụng API này để lấy giá chính xác hiển thị cho User.

**Endpoint**: `POST /api/public/shipping-methods/calculate`

**Body**:
```json
{
  "shipping_method_id": 1,
  "cart_value": 500000, // Tổng tiền hàng (subtotal)
  "weight": 2.5, // Tổng cân nặng (Kg) - Client tự tính từ product attributes hoặc default
  "destination": "Hà Nội" // Thành phố/Tỉnh nhận hàng (để tính phí vùng miền)
}
```

**Response**:
```json
{
  "shipping_method_id": 1,
  "shipping_cost": 35000 // Giá ship cuối cùng (đã cộng phụ phí nếu có)
}
```

## 3. Quy Trình Hiển Thị Tại Client

1. **Load Cart**: Kiểm tra item trong giỏ.
   - Nếu có `is_digital`: Đánh dấu là đơn hàng Digital/Mixed.
2. **Load Shipping Methods**:
   - Nếu Physical: Gọi API lấy danh sách ship. Cho user chọn. Gọi API Calculate để cập nhật tổng tiền.
   - Nếu Digital: Ẩn phần chọn ship hoặc hiện thông báo "Gửi qua Email". Phí ship = 0.
3. **Load Payment Methods**:
   - Gọi API lấy danh sách.
   - Nếu đơn hàng là Digital/Mixed: **Disable/Ẩn** phương thức có code `cod`. Chỉ hiện `vnpay`, `bank_transfer`.
   - Nếu đơn hàng Physical: Hiện tất cả.
4. **Checkout**: Gửi thông tin `shipping_method_id` và `payment_method_id` đã chọn lên API Create Order.
