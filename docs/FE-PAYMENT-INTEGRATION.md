# Hướng dẫn Tích hợp Thanh toán E-commerce (Dành cho Front-end)

Tài liệu này hướng dẫn chi tiết quy trình xử lý đặt hàng và thanh toán trên ứng dụng TMĐT, bao gồm cả hai trường hợp: **Thanh toán Offline (COD)** và **Thanh toán Online (VNPAY)**.

---

## 1. Luồng xử lý chung

1. **Gửi đơn hàng**: FE gọi API `POST /api/public/orders` kèm theo thông tin khách hàng, vận chuyển và phương thức thanh toán.
2. **Nhận phản hồi**: Backend (BE) trả về thông tin đơn hàng cùng các cờ đánh dấu loại thanh toán.
3. **Điều hướng**: 
   - Nếu là **Offline**: Chuyển đến trang "Đặt hàng thành công".
   - Nếu là **Online**: Chuyển hướng trình duyệt đến URL của cổng thanh toán.
4. **Xác nhận (Chỉ Online)**: Sau khi khách thanh toán xong, cổng thanh toán quay về một trang trên Website của bạn (Return URL). FE gọi API Verify để kiểm tra kết quả cuối cùng.

---

## 2. Bước 1: Gọi API Tạo đơn hàng

**Endpoint**: `POST /api/public/orders`

### Request Payload (Ví dụ):
```json
{
    "cart_uuid": "...", // Nếu là khách vãng lai
    "shipping_address": {
        "name": "Nguyễn Văn A",
        "phone": "0987654321",
        "email": "a@example.com",
        "province": "Hà Nội",
        "district": "Cầu Giấy",
        "address": "Số 123 Cầu Giấy"
    },
    "shipping_method_id": 1, // Lấy từ API shipping methods
    "payment_method_id": 2,  // Lấy từ API payment methods (VD: VNPAY)
    "notes": "Giao giờ hành chính"
}
```

---

## 3. Bước 2: Xử lý kết quả từ API

BE sẽ trả về cấu trúc dữ liệu như sau:

```json
{
    "success": true,
    "data": {
        "order_id": "123",
        "order_number": "ORD-ABCXYZ",
        "total_amount": "500000",
        "is_online": true,
        "payment_url": "https://sandbox.vnpayment.vn/...", // Chỉ có khi is_online = true
        "access_url": "..." 
    }
}
```

### Logic xử lý trên FE:

```javascript
const response = await createOrder(orderData);
const { is_online, payment_url, order_number } = response.data;

if (is_online && payment_url) {
    // TRƯỜNG HỢP ONLINE (VNPAY, MoMo...)
    // Chuyển hướng sang trang thanh toán của ngân hàng/ví
    window.location.href = payment_url;
} else {
    // TRƯỜNG HỢP OFFLINE (COD, Chuyển khoản)
    // Chuyển đến màn hình chúc mừng thành công
    window.location.href = `/order/success?orderCode=${order_number}`;
}
```

---

## 4. Bước 3: Xử lý sau khi Thanh toán Online (Chỉ Online)

Sau khi khách hàng hoàn tất thanh toán (hoặc hủy) trên giao diện VNPAY, họ sẽ được redirect về Website của bạn theo link đã cấu hình (thông thường là `your-website.com/payment/vnpay-return`).

Tại trang này, URL sẽ có rất nhiều tham số từ VNPAY (VD: `?vnp_Amount=...&vnp_ResponseCode=00...`).

### Công việc của FE:
1. Lấy toàn bộ Query Parameters trên URL.
2. Gọi API Verify để BE kiểm tra chữ ký và cập nhật trạng thái đơn hàng.

**Endpoint BE hỗ trợ**: `GET /api/public/payment/vnpay/return` (Hoặc FE có thể tự gọi API Verify kết quả).

> **Lưu ý**: BE hiện tại đã hỗ trợ một endpoint tập trung là `GET /api/public/payment/vnpay/return`. Nếu bạn muốn tự xử lý UI, hãy dùng kết quả trả về từ API này để hiển thị thông báo.

---

## 5. Các trạng thái đơn hàng cần lưu ý

- **Status: pending**: Đơn hàng vừa tạo, đang chờ xử lý hoặc chờ thanh toán.
- **Payment Status: pending**: Chưa thanh toán.
- **Payment Status: completed**: Đã thanh toán thành công (Online hoặc COD đã thu tiền).
- **Payment Status: failed**: Thanh toán Online thất bại.

---

## tóm tắt các API liên quan:

1. **Lấy DS phương thức vận chuyển**: `GET /api/public/shipping-methods/active`
2. **Lấy DS phương thức thanh toán**: `GET /api/public/payment-methods/active`
3. **Tạo đơn hàng**: `POST /api/public/orders`
4. **Lấy chi tiết đơn hàng (để xem lại)**: `GET /api/public/orders/access?orderCode=...&hashKey=...` (Sử dụng `access_url` trả về lúc tạo đơn).

---
*Mọi thắc mắc về tích hợp kỹ thuật, vui lòng liên hệ Team Backend.*
