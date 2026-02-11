# Tài Liệu Tích Hợp API Ecommerce: Đặt Hàng & Thanh Toán (Order & Payment)

Tài liệu này mô tả quy trình tạo đơn hàng, xử lý thanh toán và tra cứu đơn hàng sau khi mua.

## 1. Tạo Đơn Hàng (Create Order)

Sau khi user điền đầy đủ thông tin và chọn phương thức vận chuyển/thanh toán, Client gọi API này để chốt đơn.

### Endpoint
`POST /api/public/orders`

### Body Parameters
```json
{
  "cart_uuid": "...", // Bắt buộc
  "customer_name": "Nguyễn Văn A",
  "customer_email": "a@email.com", // QUAN TRỌNG: Dùng để gửi vé/sản phẩm số
  "customer_phone": "0912345678",
  "shipping_address": {
    "address": "123 Đường Láng",
    "ward": "Phường Láng Thượng",
    "district": "Quận Đống Đa",
    "city": "Hà Nội"
  },
  "billing_address": { ... }, // Optional (nếu khác shipping)
  "shipping_method_id": 1, // Bắt buộc
  "payment_method_id": 2, // Bắt buộc - ID của Payment Method user đã chọn
  "notes": "Giao hàng vào giờ hành chính"
}
```

### Response Success
```json
{
  "order_id": 1005,
  "order_number": "ORD-12345-AB",
  "status": "pending",
  "total_amount": 530000,
  "access_url": "https://domain.com/api/public/orders/access?orderCode=...&hashKey=..."
}
```
Lưu ý: `access_url` là đường dẫn dùng để tra cứu đơn hàng nhanh (không cần login).

## 2. Xử Lý Thanh Toán (Payment Processing)

Ngay sau khi nhận được `order_id` từ response trên, Client cần điều hướng user dựa trên phương thức thanh toán đã chọn.

### Trường Hợp A: Thanh Toán Offline (COD / Chuyển Khoản)
- **COD**: Hiển thị trang "Đặt hàng thành công". Thông báo user chuẩn bị tiền mặt.
- **Bank Transfer**: Hiển thị trang "Đặt hàng thành công" kèm thông tin tài khoản ngân hàng và nội dung chuyển khoản (thường là mã đơn hàng `order_number` hoặc `order_id`).

### Trường Hợp B: Thanh Toán Online (VNPay / ZaloPay...)
Client cần gọi tiếp API để lấy URL thanh toán.

**Endpoint**: `POST /api/payment/create-url`

**Body**:
```json
{
  "order_id": 1005, // Lấy từ response Create Order
  "payment_method_code": "vnpay", // Lấy từ object PaymentMethod user chọn
  "amount": 530000, // Optional (Server tự lấy từ Order)
  "customer_ip": "127.0.0.1" // Optional
}
```

**Response**:
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
}
```

**Hành động Client**:
1. Redirect (chuyển hướng) trình duyệt của user đến `paymentUrl`.
2. User thực hiện thanh toán trên trang của ngân hàng/cổng thanh toán.
3. Sau khi hoàn tất, cổng thanh toán sẽ redirect user trở lại website (URL Return) với các tham số kết quả.
   - URL Return thường là: `/payment/result` hoặc `/checkout/success`.
   - Backend sẽ xử lý xác thực (IPN/Callback) để cập nhật trạng thái đơn hàng thành `paid`.

## 3. Tra Cứu Đơn Hàng (Order Tracking)

### Dành cho User đã đăng nhập
**Endpoint**: `GET /api/public/orders`
- Trả về danh sách lịch sử mua hàng.
- Có thể lọc theo status.

### Dành cho Guest (Tra cứu nhanh)
Khách hàng truy cập link trong email hoặc nhập Mã Đơn Hàng + Email/SĐT để tra cứu.
**Endpoint**: `GET /api/public/orders/access`
**Query**:
- `orderCode`: Mã đơn (ORD-...)
- `hashKey`: Key bảo mật (được trả về lúc tạo đơn hoặc gửi trong email)

## 4. Nhận Sản Phẩm Số (Digital Assets Delivery)

Với đơn hàng chứa sản phẩm số (Ebook, License Key, Code...):

1. **Điều kiện**: Đơn hàng phải có `payment_status` là `paid` (hoặc `completed`).
2. **Truy cập**:
   - Gọi API chi tiết đơn hàng (`GET /api/public/orders/:id` hoặc `GET /access`).
   - Trong response `items`, kiểm tra trường `digital_assets`.
3. **Dữ liệu trả về**:
   - Hệ thống backend đã tự động giải mã (decrypt) nội dung asset.
   - Client hiển thị trực tiếp cho user.

**Ví dụ Response Item Digital**:
```json
{
  "product_name": "Windows 11 License",
  "quantity": 1,
  "digital_assets": [
    {
      "id": 50,
      "name": "Product Key",
      "type": "text",
      "content": "XXXX-YYYY-ZZZZ-1234", // Đã decrypt, hiển thị cho user copy
      "download_url": null
    },
    {
      "id": 51,
      "name": "Installer ISO",
      "type": "file",
      "content": "Link tải file...",
      "download_url": "https://s3..." // Link tải
    }
  ]
}
```
Lưu ý: Nếu đơn hàng chưa thanh toán (`pending`), trường `digital_assets` sẽ trả về mảng rỗng hoặc bị ẩn.
