# Tài Liệu Giao Diện: Đặt Hàng Thành Công (Order Success)

Tài liệu này mô tả API và cách hiển thị dữ liệu cho trang thông báo đặt hàng thành công (`/checkout/success`).

---

## 1. API Lấy Thông Tin Đơn Hàng (Order Access)

Hệ thống cung cấp một API bảo mật để lấy chi tiết đơn hàng mà không yêu cầu đăng nhập (phù hợp cho cả khách vãng lai).

*   **Endpoint**: `GET /api/public/orders/access`
*   **Method**: `GET`
*   **Cơ chế**: Sử dụng `orderCode` và `hashKey` được trả về từ API đặt hàng (`POST /api/public/orders`).

### Tham số Query (Query Params)
| Tham số | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `orderCode` | `string` | Mã đơn hàng (VD: `ORD-ABC12345`). |
| `hashKey` | `string` | Mã bảo mật được hệ thống sinh ra kèm theo đơn hàng. |

---

## 2. Dữ Liệu Trả Về (Response Data)

API trả về toàn bộ thông tin chi tiết để FE hiển thị:

```json
{
  "order_number": "ORD-E3A2B1C9",
  "status": "pending",           // Trạng thái đơn hàng (pending, confirmed, etc.)
  "order_type": "physical",      // physical, digital, hoặc mixed
  "customer_name": "Nguyễn Văn A",
  "customer_email": "a@example.com",
  "customer_phone": "0901234567",
  "shipping_address": "{\"address\":\"123 Đường ABC\",\"province\":\"Hà Nội\",...}",
  "subtotal": 500000,
  "shipping_amount": 30000,      // Phí vận chuyển thực tế đã lưu
  "discount_amount": 20000,      // Số tiền đã giảm
  "total_amount": 510000,        // Tổng thanh toán thực tế
  "currency": "VND",
  "payment_method": {
    "name": "Chuyển khoản ngân hàng",
    "type": "offline" 
  },
  "shipping_method": {
    "name": "Giao hàng tiêu chuẩn"
  },
  "items": [
    {
      "product_name": "Sản phẩm A",
      "variant_name": "Màu Đen",
      "quantity": 2,
      "unit_price": 250000,
      "total_price": 500000
    }
  ]
}
```

---

## 3. Giao Diện Đề Xuất (UI Design)

Trang `/checkout/success` nên hiển thị các khối thông tin sau:

### 3.1. Lời Cảm Ơn & Trạng Thái
*   Icon Check màu xanh lớn.
*   Tiêu đề: "Đặt hàng thành công!".
*   Mã đơn hàng: `#ORD-E3A2B1C9` (Dùng cái này để khách trao đổi với support).
*   Trạng thái thanh toán: Hiển thị "Chờ thanh toán" (nếu là chuyển khoản) hoặc "Sẽ thanh toán khi nhận hàng".

### 3.2. Thông Tin Khách Hàng (Dòng chảy đơn hàng)
*   **Địa chỉ nhận hàng**: Tên, SĐT, Địa chỉ chi tiết.
*   **Phương thức vận chuyển**: Tên nhà vận chuyển.
*   **Phương thức thanh toán**: Tên phương thức (VD: Momo, Chuyển khoản...).

### 3.3. Tóm Tắt Đơn Hàng (Order Summary)
*   Danh sách `items`: Ảnh (nếu có), Tên, Phân loại, Số lượng, Giá.
*   Bảng tính tiền:
    *   Tạm tính: `subtotal`
    *   Phí ship: `shipping_amount`
    *   Giảm giá: `-discount_amount`
    *   **Tổng cộng**: `total_amount` (Bôi đậm).

### 3.4. Nút Hành Động (CTA)
*   `[Tiếp tục mua sắm]`: Về trang chủ.
*   `[Theo dõi đơn hàng]`: Nếu user đã đăng nhập, dẫn về trang Lịch sử đơn hàng.

---

## 4. Lưu Ý Quan Trọng Cho FE:
1.  **Lưu Link**: FE nên lưu `orderCode` và `hashKey` vào `sessionStorage` hoặc truyền qua URL để nếu user F5 trang success vẫn hiển thị được dữ liệu.
2.  **Đơn Digital**: Nếu `order_type` là `digital`, FE có thể hiển thị thêm thông báo: *"Thông tin sản phẩm số đã được gửi vào email của bạn"*.
3.  **Xử lý JSON**: Trường `shipping_address` trả về dạng Stringified JSON, FE cần `JSON.parse()` trước khi hiển thị.
