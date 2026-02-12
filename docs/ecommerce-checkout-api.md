# Tài Liệu Tích Hợp API Ecommerce: Thanh Toán & Vận Chuyển

Tài liệu này chi tiết hóa các API cần thiết để xây dựng luồng Checkout trên Frontend.

---

## 1. Phương Thức Vận Chuyển (Shipping Methods)

### 1.1. Lấy danh sách vận chuyển khả dụng
Dùng để hiển thị các lựa chọn cho người dùng (Giao hàng nhanh, Tiết kiệm, Hỏa tốc).

*   **Endpoint**: `GET /api/public/shipping-methods/active`
*   **Response**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "Standard Delivery",
          "code": "standard",
          "description": "3-5 business days",
          "base_cost": 30000
        }
      ]
    }
    ```

### 1.2. Tính phí vận chuyển (Shipping Calculation)
Sử dụng khi người dùng thay đổi địa chỉ hoặc chọn phương thức vận chuyển khác.

*   **Endpoint**: `POST /api/public/shipping-methods/calculate`
*   **Payload**:
    ```json
    {
      "shipping_method_id": 1,
      "cart_value": 500000,
      "weight": 0.5,
      "destination": "Ho Chi Minh City"
    }
    ```
*   **Response**:
    ```json
    {
      "success": true,
      "data": {
        "shipping_fee": 30000,
        "estimated_days": "3-5 days"
      }
    }
    ```

---

## 2. Phương Thức Thanh Toán (Payment Methods)

### 2.1. Lấy danh sách thanh toán
*   **Endpoint**: `GET /api/public/payment-methods`
*   **Response**: `data` chứa mảng các phương thức (`cod`, `bank_transfer`, `vnpay`).

### 2.2. Kiểm tra tính khả dụng (COD Logic)
*   **Quy tắc**: Nếu giỏ hàng có sản phẩm số (Kiểm tra `is_digital: true` trong mỗi item), Frontend phải ẩn hoặc disable lựa chọn `Thanh toán khi nhận hàng (COD)`.

---

## 3. Mã Giảm Giá (Coupons & Discounts)

Quy trình áp dụng mã giảm giá ảnh hưởng trực tiếp đến `total_amount` của giỏ hàng.

### 3.1. Lấy danh sách mã public
*   **Endpoint**: `GET /api/public/discounts/coupons/available`

### 3.2. Áp dụng mã (Apply Coupon)
*   **Endpoint**: `POST /api/public/discounts/apply-coupon`
*   **Payload**:
    ```json
    {
      "cart_uuid": "...", 
      "coupon_code": "DISCOUNT10"
    }
    ```
*   **Mô tả**: Khi gọi API này thành công, backend sẽ update `discount_amount` vào Cart Header. Frontend cần lấy lại thông tin giỏ hàng mới từ response để cập nhật UI.

### 3.3. Gỡ mã (Remove Coupon)
*   **Endpoint**: `DELETE /api/public/discounts/remove-coupon/:cart_uuid`

---

## 4. Luồng Tạo Đơn Hàng (Order Creation)

Đây là bước cuối cùng sau khi người dùng nhấn "Đặt hàng".

### 4.1. Tạo đơn hàng từ giỏ hàng
*   **Endpoint**: `POST /api/public/orders`
*   **Payload**: Xem chi tiết tại `docs/ecommerce-integration.md`.
*   **Lưu ý quan trọng**:
    *   Nếu chọn `payment_method` là **Online (VNPay)**, sau khi API trả về thành công, bạn cần lấy `order_id` để gọi tiếp API lấy link thanh toán.
    *   Nếu là **COD/Bank Transfer**, bạn có thể chuyển ngay sang trang "Cảm ơn".

### 4.2. Lấy link thanh toán (Cho Online Payment)
*   **Endpoint**: `POST /api/payment/create-url`
*   **Payload**: `{ "order_id": 123, "payment_method_code": "vnpay" }`
*   **Response**: `{ "url": "https://vnpay.vn/..." }` -> Redirect người dùng sang URL này.

---

## 5. Tổng Kết Luồng Checkout Trên Frontend

1.  **Bước 1**: Load `payment-methods` và `shipping-methods`.
2.  **Bước 2**: Khi user nhập địa chỉ -> Gọi `calculate-shipping` -> Update phí ship vào UI.
3.  **Bước 3**: (Tùy chọn) User nhập mã giảm giá -> Gọi `apply-coupon` -> Update giá tổng vào UI.
4.  **Bước 4**: Bấm đặt hàng -> Gọi `POST /public/orders`.
5.  **Bước 5**: Xử lý kết quả (Success/Payment Redirect).
