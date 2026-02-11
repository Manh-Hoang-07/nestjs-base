# Tài Liệu Tích Hợp API Ecommerce: Giỏ Hàng (Cart)

Tài liệu này hướng dẫn tích hợp tính năng giỏ hàng, bao gồm thêm sản phẩm, cập nhật số lượng và quản lý giỏ hàng cho cả khách vãng lai (Guest) và thành viên (User).

## 1. Định Danh Giỏ Hàng (Cart Identification)

Hệ thống sử dụng cơ chế `cart_uuid` để định danh giỏ hàng cho khách chưa đăng nhập.

### Logic Client-Side:
1. Khi user truy cập website lần đầu, Client tự generate một UUID v4 (ví dụ: `550e8400-e29b-41d4-a716-446655440000`).
2. Lưu UUID này vào **LocalStorage** (key gợi ý: `cart_uuid`).
3. Gửi kèm `cart_uuid` này trong **TẤT CẢ** các request liên quan đến giỏ hàng.
4. Nếu user **Đăng nhập**: Hệ thống sẽ tự động merge giỏ hàng của Guest (theo `cart_uuid`) vào giỏ hàng của User (theo `user_id`). Sau khi login, client vẫn nên gửi `cart_uuid` để đảm bảo tính nhất quán nếu backend yêu cầu, nhưng ưu tiên `user_id` từ token.

## 2. API Lấy Thông Tin Giỏ Hàng

### Endpoint
`GET /api/public/cart`

### Query Parameters
| Tham số | Bắt buộc | Mô tả |
| :--- | :--- | :--- |
| `cart_uuid` | Có (với Guest) | UUID định danh giỏ hàng |

### Response Example
```json
{
  "id": 123,
  "cart_uuid": "...",
  "user_id": null,
  "subtotal": 500000,
  "tax_amount": 0,
  "shipping_amount": 0,
  "discount_amount": 0,
  "total_amount": 500000,
  "items": [
    {
      "id": 1,
      "product_id": 10,
      "product_variant_id": 101, // ID biến thể thực tế
      "product_name": "Áo Thun Basic",
      "variant_name": "Màu Đỏ - Size S",
      "quantity": 2,
      "unit_price": 150000,
      "total_price": 300000,
      "product_attrbutes": {...}
    }
  ]
}
```

## 3. Thêm Sản Phẩm Vào Giỏ (Add to Cart)

### Endpoint
`POST /api/public/cart/add`

### Body Parameters
```json
{
  "cart_uuid": "UUID-...", // Bắt buộc
  "product_variant_id": 101, // Bắt buộc - ID của biến thể sản phẩm
  "quantity": 1 // Bắt buộc - Số lượng muốn thêm
}
```

### Logic Xử Lý:
- **Variant ID**: Luôn phải gửi `product_variant_id`. Nếu là sản phẩm đơn giản, Client cần lấy ID của biến thể mặc định từ API Product Detail.
- **Sản Phẩm Số**:
  - Vẫn thêm vào giỏ như bình thường.
  - Hệ thống có thể (tùy cấu hình) giới hạn số lượng mua là 1 đối với một số loại sản phẩm số (ví dụ: Khóa học, Ebook).
  - Nếu sản phẩm đã có trong kho "Assets" của user (đã mua rồi), API có thể trả về lỗi hoặc cảnh báo tuỳ logic business.
- **Tồn Kho**: API sẽ kiểm tra tồn kho (`stock_quantity`) của Variant. Nếu không đủ, API trả về lỗi 400.

## 4. Cập Nhật Giỏ Hàng

### Cập nhật số lượng item
**Endpoint**: `PUT /api/public/cart/items/:id` (hoặc `/api/public/cart/update`)
**Body**:
```json
{
  "cart_uuid": "UUID-...",
  "quantity": 3
}
```
- Nếu `quantity` = 0, item sẽ bị xóa khỏi giỏ.
- API sẽ tính toán lại tổng tiền (`total_amount`) và trả về thông tin giỏ hàng mới nhất.

### Xóa sản phẩm khỏi giỏ
**Endpoint**: `DELETE /api/public/cart/item/:id`
**Query**: `cart_uuid=...`

### Làm trống giỏ hàng (Clear Cart)
**Endpoint**: `DELETE /api/public/cart/clear`
**Query**: `cart_uuid=...`

## 5. Mã Giảm Giá (Coupon/Discount)

(Nếu hệ thống hỗ trợ)
### Endpoint
`POST /api/public/cart/apply-coupon`
### Body
```json
{
  "cart_uuid": "...",
  "code": "SUMMER2025"
}
```
### Response
Trả về giỏ hàng đã được cập nhật `discount_amount` và `total_amount`.
Nếu mã không hợp lệ, trả về lỗi 400.
