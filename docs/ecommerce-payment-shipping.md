# Tài Liệu Giao Diện & Dữ Liệu: Thanh Toán & Vận Chuyển 

Tài liệu này tập trung mô tả chi tiết các thành phần UI (Components) cho việc lựa chọn Phương thức Thanh toán và Vận chuyển trong trang Checkout.

---

## 1. Component: Chọn Phương Thức Vận Chuyển (Shipping Method Selection)

Thường nằm ở Bước 2 hoặc 3 trong quy trình Checkout.

### 1.1. Dữ Liệu Đầu Vào (Input Data)
API trả về danh sách:
```json
[
  { "id": 1, "code": "standard", "name": "Tiêu chuẩn", "price": 30000, "desc": "3-5 ngày" },
  { "id": 2, "code": "express", "name": "Hoả tốc", "price": 50000, "desc": "1-2 ngày" }
]
```

### 1.2. Mô Tả Giao Diện (UI Description)
Hiển thị dạng danh sách các thẻ (Card) hoặc Radio list.

*   **Trạng thái chờ (Loading)**:
    *   Khi user thay đổi Tỉnh/Thành phố ở bước Địa chỉ, khu vực này cần hiện Skeleton Loading hoặc mờ đi để tính lại phí ship.
*   **Item Giao Diện (Shipping Option)**:
    *   **Cấu trúc**: Flexbox row.
    *   **Radio Input**: Bên trái ngoài cùng.
    *   **Label Chính**: Tên phương thức (vd: "Giao hàng nhanh"). Font đậm.
    *   **Label Phụ**: Mô tả + Thời gian (vd: "Dự kiến giao 20/10 - 22/10"). Font nhỏ, màu xám.
    *   **Giá tiền**: Bên phải ngoài cùng. Font đậm.
*   **Tương tác (Interaction)**:
    *   Click vào toàn bộ vùng (Box) -> Chọn Radio.
    *   Khi chọn: Update ngay dòng "Phí vận chuyển" và "Tổng cộng" ở cột Order Summary.

### 1.3. Trường Hợp Đặc Biệt
*   **Digital Product**: Ẩn hoàn toàn component này hoặc hiển thị text: "*Sản phẩm sẽ được gửi qua email. Không cần vận chuyển.*"
*   **Free Ship**: Nếu giá = 0 -> Hiển thị text "Miễn phí" hoặc "0đ" (Màu xanh lá cây).

---

## 2. Component: Chọn Phương Thức Thanh Toán (Payment Method Selection)

Thành phần quan trọng quyết định tỷ lệ chốt đơn (conversion rate).

### 2.1. Dữ Liệu Đầu Vào
Gồm: `id`, `code`, `name`, `icon_url`, `description`, `type` (online/offline).

### 2.2. Mô Tả Giao Diện (UI Description)
Thiết kế dạng danh sách dọc hoặc lưới (Grid).

#### A. Danh sách lựa chọn (Selection List)
*   **Phong cách**: Mỗi phương thức là một Box có Border. Khi chọn (Active) sẽ đổi màu border (vd: Xanh dương) và hiện dấu tích.
*   **Nội dung Box**:
    *   **Icon/Logo** (Bắt buộc): Logo VNPay, Visa, MoMo, hoặc Icon COD (Xe hàng/Tiền). Kích thước khoảng 32-40px.
    *   **Tên phương thức**: "Thanh toán qua VNPAY" (Font size trung bình).
    *   **Radio Button**: Có thể đặt góc phải hoặc trái.

#### B. Phần Nội Dung Mở Rộng (Collapse Content)
Khi user click chọn một phương thức, có thể sổ ra (collapse) nội dung hướng dẫn bên dưới Box đó:
*   **Với COD**: Text: "Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị số tiền tương ứng."
*   **Với Chuyển Khoản (Bank Transfer)**:
    *   *Trước khi đặt*: Text hướng dẫn "Sau khi đặt hàng, bạn sẽ nhận được thông tin QR Code để chuyển khoản."
    *   *Lưu ý*: Không hiện QR Code ngay tại bước này để tránh user chuyển tiền mà chưa bấm "Đặt hàng".
*   **Với Online (VNPay)**: Text: "Bạn sẽ được chuyển hướng sang cổng thanh toán VNPay để hoàn tất."

### 2.3. Logic Ẩn/Hiện (Validation Logic)
Frontend cần xử lý logic hiển thị dựa trên giỏ hàng:
1.  **Check Cart Items**: Duyệt qua danh sách item trong giỏ.
2.  **Condition**: Nếu có *bất kỳ* item nào có `is_digital = true`.
3.  **Action**:
    *   Tìm phương thức có `code = 'cod'`.
    *   Thêm class `disabled` (làm mờ, không click được).
    *   Thêm Tooltip hoặc dòng thông báo nhỏ dưới COD: "*Không khả dụng cho đơn hàng có sản phẩm số*".

---

## 3. Giao Diện Kết Quả Thanh Toán (Payment Result UI)

Trang hiển thị sau khi quay lại từ cổng thanh toán (Return URL).

### 3.1. Thành Công (Success)
*   **Màu chủ đạo**: Xanh lá cây.
*   **Icon**: Checkmark tròn lớn, animation vẽ vòng tròn.
*   **Title**: "Thanh toán thành công!".
*   **Sub-title**: "Đơn hàng #ORD... của bạn đã được xác nhận."
*   **Thông tin giao dịch**:
    *   Mã giao dịch (Trans ID): 123456...
    *   Số tiền: 500.000đ.
    *   Thời gian: 10:20 20/02/2026.
*   **Button**: "Xem chi tiết đơn hàng".

### 3.2. Thất Bại (Failed)
*   **Màu chủ đạo**: Đỏ/Cam.
*   **Icon**: Dấu X tròn hoặc Cảnh báo.
*   **Title**: "Thanh toán thất bại" hoặc "Giao dịch chưa hoàn tất".
*   **Lý do**: Hiển thị lý do từ cổng thanh toán trả về (vd: "Số dư không đủ", "Nguời dùng huỷ giao dịch").
*   **Action Suggestion**:
    *   "Bạn có thể thử thanh toán lại hoặc chọn phương thức khác."
*   **Button**:
    *   Button chính: "Thanh toán lại" (Quay lại trang Checkout hoặc gọi API lấy lại link payment mới cho đơn hàng đó).
    *   Button phụ: "Về trang chủ".
