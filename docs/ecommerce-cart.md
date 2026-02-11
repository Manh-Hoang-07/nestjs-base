# Tài Liệu Giao Diện & Dữ Liệu: Giỏ Hàng (Cart)

Tài liệu này mô tả chi tiết giao diện (UI) trang Giỏ hàng và luồng xử lý dữ liệu.

---

## 1. Dữ Liệu Giỏ Hàng (Cart Data Model)

Dữ liệu giỏ hàng cần hiển thị (Response từ `/api/public/cart`).

| Trường dữ liệu | Vị trí UI | Mô tả |
| :--- | :--- | :--- |
| `items` | Vùng danh sách sản phẩm | Mảng các sản phẩm trong giỏ. |
| `subtotal` | Vùng tổng kết (Summary) | Tổng tiền hàng chưa tính phí khác. |
| `discount_amount`| Vùng tổng kết | Số tiền được giảm giá (nếu có coupon). |
| `shipping_amount`| Vùng tổng kết | Phí vận chuyển (thường là tạm tính hoặc 0 ở bước này). |
| `total_amount` | Vùng tổng kết | Tổng tiền thanh toán cuối cùng (To nhất). |

### 1.1. Chi tiết Line Item (`items` array detail)
Mỗi item trong giỏ hàng (`items[i]`) cần có:
*   `product_id` & `product_variant_id`.
*   `image`: Ảnh thumbnail của biến thể (hoặc ảnh sp gốc).
*   `name`: Tên sản phẩm.
*   `variant_text`: Tên biến thể để user nhận diện (vd: "Màu: Đỏ, Size: M").
*   `unit_price`: Đơn giá tại thời điểm hiện tại.
*   `quantity`: Số lượng user đang chọn.
*   `total_price`: `unit_price * quantity`.
*   `slug`: Để click vào quay lại trang detail.

---

## 2. Giao Diện Giỏ Hàng (Cart Page UI)

Trang `/cart`. Layout thường chia 2 phần: **Danh sách sản phẩm (Trái - 65%)** và **Tổng tiền (Phải - 35%)**.

### 2.1. Cột Trái: Danh Sách Sản Phẩm

#### A. Header Bảng
*   Cột 1: Sản phẩm (Rộng nhất).
*   Cột 2: Đơn giá.
*   Cột 3: Số lượng.
*   Cột 4: Thành tiền.
*   Cột 5: Xoá (Icon thùng rác).

#### B. Dòng Sản Phẩm (Item Row)
Mỗi item hiển thị 1 dòng (Row):
*   **Cột Sản Phẩm**:
    *   Ảnh thumbnail (80x80px).
    *   Thông tin text (bên cạnh ảnh):
        *   Tên sản phẩm (Link trỏ về detail).
        *   Phân loại: "Màu: Xanh | Size: 42" (Màu xám nhỏ).
        *   *Optional*: Badge "Hết hàng" nếu stock = 0.
*   **Cột Đơn giá**: Hiển thị giá hiện tại (vd: 150.000đ).
*   **Cột Số lượng**:
    *   Bộ điều khiển: `[-] [Input số] [+]`.
    *   *Logic*:
        *   Nút `[-]` disable nếu qty = 1 (hoặc click biến thành xoá).
        *   Nút `[+]` disable nếu đạt giới hạn tồn kho.
        *   Khi thay đổi số, gọi API update `cart_item_id` ngay lập tức (debounce) hoặc nút "Cập nhật giỏ".
*   **Cột Thành tiền**: Hiển thị `total_price` (In đậm).
*   **Cột Xoá**: Nút icon (X hoặc Thùng rác). Click -> Confirm -> Xoá dòng.

#### C. Empty State (Giỏ hàng trống)
Nếu `items.length === 0`:
*   Ẩn toàn bộ layout 2 cột.
*   Hiển thị icon giỏ hàng rỗng ở giữa màn hình.
*   Text: "Giỏ hàng của bạn đang trống".
*   Nút: "Tiếp tục mua sắm" -> Link về Home.

### 2.2. Cột Phải: Tổng Kết Đơn Hàng (Order Summary)

Box này thường dính (sticky) khi cuộn trang.

1.  **Tiêu đề**: "Cộng giỏ hàng".
2.  **Các dòng tính toán**:
    *   Tạm tính (Subtotal): `500.000đ`.
    *   Giảm giá (Discount): `-0đ` (Nếu chưa áp mã).
    *   Phí vận chuyển: "Tính khi thanh toán".
3.  **Mã giảm giá (Coupon Input)**:
    *   Input text: "Nhập mã khuyến mãi".
    *   Button: "Áp dụng".
    *   *Feedback*: Thông báo xanh (Thành công) hoặc đỏ (Mã sai/hết hạn) ngay bên dưới.
4.  **Divider (Gạch ngang)**.
5.  **Tổng cộng (Total)**:
    *   Label: "Tổng tiền".
    *   Value: **500.000đ** (Font rất lớn, màu đỏ/thương hiệu).
    *   Note: "(Đã bao gồm VAT nếu có)".
6.  **Nút CTA (Call to Action)**:
    *   Nút "Tiến hành thanh toán" (Proceed to Checkout).
    *   Full width, màu nổi bật.
    *   Click -> Chuyển sang trang `/checkout`.

---

## 3. Mini Cart (Giỏ Hàng Rút Gọn)

Thường là Dropdown khi hover vào icon giỏ hàng trên Header hoặc Drawer trượt từ phải sang.

### Giao diện
*   **Header**: "Giỏ hàng (3)".
*   **List**: Scrollable list (chỉ hiển thị tối đa 3-5 item).
    *   Item: Ảnh nhỏ, Tên (cắt ngắn), x Số lượng, Giá.
    *   Nút Xoá nhanh item.
*   **Footer Mini Cart**:
    *   Tổng tiền tạm tính.
    *   2 Nút: "Xem giỏ hàng" (Outline) và "Thanh toán" (Solid).

---

## 4. Các Trạng Thái UI Cần Lưu Ý

1.  **Loading**: Khi user update số lượng, Box "Tổng kết" bên phải nên mờ đi (opacity) và hiện spinner loading để user biết đang tính lại tiền.
2.  **Stock Error**: Nếu user update lên số lượng > tồn kho, hiện thông báo Toast "Chỉ còn 5 sản phẩm trong kho" và tự reset số lượng về max.
3.  **Digital Product**: Nếu item là sản phẩm số, UI không khác biệt nhiều, nhưng có thể thêm 1 icon/badge nhỏ "Digital" để user biết đây là sản phẩm tải về.
