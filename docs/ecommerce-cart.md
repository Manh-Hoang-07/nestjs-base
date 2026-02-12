# Tài Liệu Giao Diện & Dữ Liệu: Giỏ Hàng (Cart)

Tài liệu này mô tả chi tiết các API, luồng dữ liệu và giao diện (UI) của trang Giỏ hàng.

---

## 1. Danh Sách API (Cart APIs)

Các API này thuộc nhóm `public`, cho phép cả khách vãng lai (Guest) và thành viên (Member) sử dụng.
*   **Guest**: Sử dụng `cart_uuid` (lưu ở LocalStorage/Cookie) để định danh giỏ hàng.
*   **Member**: Hệ thống tự động nhận diện qua Token đăng nhập (nếu có), nhưng vẫn nên gửi kèm `cart_uuid` để merge giỏ hàng nếu cần.

| Chức năng | Method | Endpoint | Input (Body/Query) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Lấy giỏ hàng** | `GET` | `/api/public/cart` | Query: `cart_uuid` (opt) | Lấy danh sách sản phẩm và tổng tiền tạm tính. |
| **Thêm sản phẩm** | `POST` | `/api/public/cart/add` | Body: `{ product_variant_id, quantity, cart_uuid }` | Thêm mới item hoặc cộng dồn số lượng nếu đã có. |
| **Cập nhật SL** | `PUT` | `/api/public/cart/items/:id` | Param: `id` (cart_item_id)<br>Body: `{ quantity }`<br>Query: `cart_uuid` | Cập nhật số lượng của một item trong giỏ. |
| **Xoá item** | `DELETE` | `/api/public/cart/item/:id` | Param: `id` (cart_item_id)<br>Query: `cart_uuid` | Xoá hẳn một dòng sản phẩm khỏi giỏ. |
| **Làm sạch giỏ** | `DELETE` | `/api/public/cart/clear` | Query: `cart_uuid` | Xoá toàn bộ sản phẩm trong giỏ. |

---

## 2. Dữ Liệu Giỏ Hàng (Response Data)

Dữ liệu trả về từ API `/api/public/cart`:

```json
{
  "cart_uuid": "uuid-string...",
  "items": [
    {
      "id": 101, // cart_item_id - Dùng để update/delete
      "product_variant_id": 55,
      "product_id": 20,
      "name": "Áo Thun Premium",
      "slug": "ao-thun-premium",
      "variant_text": "Màu: Đen, Size: XL",
      "image": "https://...",
      "unit_price": 250000,
      "quantity": 2,
      "total_line_price": 500000
    }
  ],
  "subtotal_amount": 500000,
  "total_quantity": 2
}
```

**Lưu ý quan trọng**:
*   Tại bước Giỏ hàng, **CHƯA CÓ** các trường:
    *   `shipping_fee`: Phí vận chuyển (Tính ở Checkout).
    *   `discount_amount`: Mã giảm giá (Nhập ở Checkout).
    *   `final_total`: Tổng thanh toán cuối cùng (Tính ở Checkout).
*   Giỏ hàng chỉ hiển thị **Tạm tính (Subtotal)**.

---

## 3. Giao Diện Giỏ Hàng (Cart Page UI)

Trang `/cart`. Layout chia 2 phần: **Danh sách sản phẩm (Trái)** và **Tổng kết (Phải)**.

### 3.1. Cột Trái: Danh Sách Sản Phẩm

Hiển thị dạng bảng hoặc danh sách dòng (Row).

1.  **Header Bảng**: Sản phẩm - Đơn giá - Số lượng - Thành tiền - Xoá.
2.  **Dòng Item (Loop `items`)**:
    *   **Ảnh & Thông tin**:
        *   Ảnh thumbnail (click về trang detail).
        *   Tên sản phẩm (click về trang detail).
        *   Biến thể: "Màu: ... | Size: ..." (Text xám nhỏ).
    *   **Đơn giá**: `unit_price` (format tiền tệ).
    *   **Số lượng (Input stepper)**:
        *   Nút `[-]` và `[+]`.
        *   Ô input hiển thị `quantity`.
        *   *Hành động*: Khi thay đổi, gọi API `PUT /api/public/cart/items/:id` (debounce 500ms) để cập nhật.
    *   **Thành tiền**: `total_line_price`.
    *   **Nút Xoá**: Icon thùng rác -> Gọi API `DELETE`.

3.  **Trạng thái Trống**:
    *   Nếu `items.length == 0`: Hiện thông báo "Giỏ hàng trống" và nút "Tiếp tục mua hàng" (về Home).

### 3.2. Cột Phải: Tổng Kết (Cart Summary)

Phần này chỉ tóm tắt giá trị hàng hoá.

1.  **Tiêu đề**: "Tổng tiền giỏ hàng".
2.  **Tạm tính (Subtotal)**: Hiển thị `subtotal_amount`.
3.  **Thông báo**: "Phí vận chuyển và mã giảm giá sẽ được tính ở bước Thanh toán".
4.  **Nút CTA "Thanh toán"**:
    *   Text: "Tiến hành thanh toán" (Proceed to Checkout).
    *   Action: Chuyển hướng sang trang `/checkout`.

> **Lưu ý UI**: Không hiển thị ô nhập Coupon (Discount Code) ở trang này. User sẽ nhập mã tại trang Checkout để đảm bảo logic tính toán tổng thể (cùng phí ship).

---

## 4. Mini Cart (Giỏ hàng nhanh)

Thường nằm ở Header (Dropdown hoặc Drawer).

*   **Hiển thị**:
    *   Danh sách `items` (tối đa 3-5 item mới nhất).
    *   Nút xoá nhanh (`x`).
*   **Footer Mini Cart**:
    *   Tổng tiền tạm tính (`subtotal_amount`).
    *   Nút "Xem giỏ hàng" (`/cart`).
    *   Nút "Thanh toán" (`/checkout`).

---

## 5. Logic Xử Lý Frontend

1.  **Lưu `cart_uuid`**:
    *   Khi Add to cart lần đầu, nếu chưa có `cart_uuid` trong LocalStorage, lấy từ response trả về và lưu lại.
    *   Các request sau luôn gửi kèm `?cart_uuid=...`.
2.  **Debounce Update**:
    *   Khi user bấm tăng/giảm số lượng liên tục, chỉ gọi API update sau khi user dừng thao tác khoảng 300-500ms để tránh spam server.
3.  **Loading State**:
    *   Khi đang gọi API (add/update/delete), nên làm mờ (opacity) vùng giỏ hàng hoặc hiện spinner nhỏ để user biết hệ thống đang xử lý.
