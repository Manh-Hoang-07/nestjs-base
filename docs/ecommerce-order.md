# Tài Liệu Giao Diện & Dữ Liệu: Đơn Hàng (Order History & Checkout)

Tài liệu này mô tả chi tiết giao diện trang **Thanh toán (Checkout)** và trang **Quản lý đơn hàng (Order History)**.

---

## PHẦN 1: THANH TOÁN (CHECKOUT UI)

URL: `/checkout`. Đây là trang quan trọng nhất, cần giao diện sạch, tin cậy.

### 1.1. Bố Cục (Layout)
Chia 2 cột:
*   **Cột Trái (Main Step)**: Nhập liệu thông tin (60-70%).
*   **Cột Phải (Order Summary)**: Tóm tắt đơn hàng (30-40%), Sticky.

### 1.2. Cột Trái - Các Bước Nhập Liệu
Có thể thiết kế dạng **Accordion** (Mở từng bước) hoặc **One Page Checkout** (Hiện hết). Dưới đây mô tả One Page.

#### Block 1: Thông Tin Khách Hàng
*   Tiêu đề: "Thông tin liên hệ".
*   Nếu chưa login:
    *   Text: "Bạn đã có tài khoản? [Đăng nhập]"
    *   Input: Họ và tên, Số điện thoại, Email (Bắt buộc để gửi đơn hàng).
*   Nếu đã login: Tự động fill thông tin User.

#### Block 2: Địa Chỉ Giao Hàng (Shipping Address)
*   **Sản phẩm Vật lý**:
    *   Dropdown: Tỉnh/Thành phố -> Quận/Huyện -> Phường/Xã (Load động dữ liệu hành chính).
    *   Input: Địa chỉ cụ thể (Số nhà, đường).
    *   Checkbox: "Lưu vào sổ địa chỉ" (Nếu login).
*   **Sản phẩm Số**:
    *   Có thể ẩn Block này hoặc thay bằng dòng text: "Thông tin đơn hàng sẽ được gửi qua Email của bạn."

#### Block 3: Phương Thức Vận Chuyển (Shipping Method)
*   Chỉ hiện khi đơn hàng có sản phẩm vật lý.
*   UI: List các Radio Button.
    *   **(o) Giao hàng tiêu chuẩn** - 30.000đ
        *   *Mô tả*: Dự kiến giao: 3-5 ngày.
    *   **( ) Giao hàng hoả tốc** - 50.000đ
        *   *Mô tả*: Nhận hàng trong 24h.
*   *Interaction*: Khi tick chọn, số tiền "Phí vận chuyển" bên cột phải phải nhảy số ngay lập tức.

#### Block 4: Phương Thức Thanh Toán (Payment Method)
*   UI: List Radio Button dạng Box (Card).
    *   **(o) [Icon] COD - Thanh toán khi nhận hàng**
        *   *Note*: "Chỉ áp dụng cho đơn vật lý." (Disable nếu Cart có Digital Product).
    *   **( ) [Icon] Chuyển khoản ngân hàng (QR Code)**
    *   **( ) [Icon] Ví VNPay / Thẻ ATM**
*   *Lưu ý*: Hiển thị rõ ràng các icon logo phương thức thanh toán để tăng độ tin cậy.

### 1.3. Cột Phải - Order Summary
Background màu xám nhạt để phân biệt.
1.  **List sản phẩm rút gọn**:
    *   Ảnh nhỏ (50px).
    *   Tên + Biến thể.
    *   Số lượng (x2).
    *   Giá tổng.
2.  **Mã giảm giá**: (Nếu chưa nhập ở Cart thì nhập ở đây).
3.  **Các dòng tính tiền**:
    *   Tạm tính: 100.000đ
    *   Phí vận chuyển: 30.000đ (Cập nhật theo Block 3).
    *   Giảm giá: -0đ
4.  **Tổng cộng (Total)**: **130.000đ**.
5.  **Nút ĐẶT HÀNG (Place Order)**:
    *   To, Rõ, Màu Brand.
    *   Click -> Gọi API `Create Order`.

---

## PHẦN 2: TRANG CẢM ƠN (THANK YOU PAGE)

Sau khi đặt hàng thành công (hoặc thanh toán xong).
*   **Icon Success**: Dấu tích xanh lớn.
*   **Tiêu đề**: "Đặt hàng thành công!".
*   **Mã đơn hàng**: "Mã đơn của bạn: #ORD-12345" (Cho phép copy).
*   **Lời nhắn**: "Cảm ơn bạn đã mua hàng. Email xác nhận đã được gửi tới...".
*   **Nút**: "Tiếp tục mua sắm" hoặc "Xem chi tiết đơn hàng".

---

## PHẦN 3: QUẢN LÝ ĐƠN HÀNG (MY ORDERS)

URL: `/account/orders`. Dành cho user đã đăng nhập.

### 3.1. Danh Sách Đơn Hàng (List)
Dạng Bảng hoặc List Card (tốt cho mobile).
*   **Header Filter**: Tab (Tất cả | Chờ thanh toán | Đang giao | Hoàn thành | Đã huỷ).
*   **Item Đơn Hàng**:
    *   Header: Mã đơn (#123) - Ngày đặt (01/01/2025) - **Trạng thái (Badge màu)**.
    *   Body: List 1-2 sản phẩm đại diện (Ảnh + Tên). "Và 3 sản phẩm khác...".
    *   Tổng tiền: "Tổng tiền: **500.000đ**".
    *   Footer Actions:
        *   Nút "Xem chi tiết".
        *   Nút "Mua lại" (Re-order).
        *   Nút "Thanh toán ngay" (Nếu trạng thái là Pending Payment).

---

## PHẦN 4: CHI TIẾT ĐƠN HÀNG (ORDER DETAIL)

URL: `/account/orders/:id` (hoặc `/orders/tracking` cho Guest).

### 4.1. Thông Tin Chung (Header Info)
*   **Trạng thái đơn hàng**: Timeline (Process Bar).
    *   [x] Đã đặt -> [x] Đã thanh toán -> [Active] Đang vận chuyển -> [ ] Giao thành công.
*   **Ngày đặt**: Giờ/Ngày/Tháng/Năm.

### 4.2. Khu Vực Sản Phẩm Số (Digital Delivery) - QUAN TRỌNG
*Chỉ hiển thị nếu đơn hàng có sản phẩm số và đã thanh toán (Status = Paid).*
*   **Tiêu đề Box**: "Sản phẩm số của bạn" (Highlight nền vàng/xanh nhật).
*   **List Item**:
    *   Tên sản phẩm: "Ebook Học ReactJS".
    *   **Nội dung**:
        *   Nếu là Key/Code: Hiển thị mã "X8S-22KL-..." + Nút Copy.
        *   Nếu là File: Nút "Download" (Link tới file).
    *   *Note*: "Link tải có hiệu lực trong 24h".

### 4.3. Thông Tin Chi Tiết (Grid Info)
Chia 2 hoặc 3 cột:
1.  **Địa chỉ nhận hàng**: Tên, SĐT, Địa chỉ chi tiết.
2.  **Thanh toán**: Phương thức (VNPay), Trạng thái (Đã thanh toán).
3.  **Vận chuyển**: Đơn vị (Giao hàng nhanh), Mã vận đơn (Tracking ID - Link sang trang carrier).

### 4.4. Danh Sách Sản Phẩm (Item Table)
Giống UI Giỏ hàng nhưng không sửa xoá được.
*   Hiển thị đầy đủ variant, giá tiền, số lượng.
*   **Nút Hành Động mỗi dòng** (Nếu đơn đã hoàn thành): "Viết đánh giá" (Review).

### 4.5. Tổng Kết Tiền
*   Hiển thị lại Subtotal, Shipping, Discount, Total.
