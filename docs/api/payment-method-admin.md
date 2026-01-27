## Tích hợp API quản lý phương thức thanh toán (Admin)

- **Mục tiêu**
  - Cho phép admin quản lý danh sách phương thức thanh toán (COD, VNPAY, …) qua API.
  - FE Admin có thể: xem danh sách, tạo mới, cập nhật, bật/tắt, xem chi tiết.

## Khái quát model & seed mặc định

- **Bảng `payment_methods` (Prisma model `PaymentMethod`)**
  - Trường chính:
    - `id`: bigint, khóa chính.
    - `name`: tên hiển thị, ví dụ: `Thanh toán khi nhận hàng (COD)`, `Thanh toán qua VNPay`.
    - `code`: mã duy nhất, dùng để tích hợp logic (`COD`, `VNPAY`, ...).
    - `type`: `online | offline` (enum `PaymentType`).
    - `status`: `active | inactive` (enum `BasicStatus`).
    - `config`: `Json?` – nơi lưu cấu hình chi tiết (API key, merchant code, secret, returnUrl, v.v.).
  - Seeder `SeedEcommerce` đã tạo sẵn:
    - `COD` (offline, active).
    - `VNPAY` (online, active).

## Menu & permission trong Admin

- **Menu Admin**
  - Group `Ecommerce`:
    - Code: `ecommerce`, path: `/admin/ecommerce`.
  - Menu con cho payment methods:
    - Code: `ecommerce-payment-methods`.
    - Path FE: `/admin/ecommerce/payment-methods`.
    - API path: `api/admin/ecommerce/payment-methods`.
    - Icon: `💳`.
- **Permission**
  - Code: `payment_method.manage`.
  - Menu route `ecommerce-payment-methods` yêu cầu quyền này làm `required_permission`.
  - Group `ecommerce` gom thêm các quyền ecommerce khác (`product.manage`, `order.manage`, `coupon.manage`, ...).

## Endpoint chính (Admin Payment Method)

> Lưu ý: tên route thực tế phụ thuộc file controller `payment-method/admin` trong module ecommerce. Dưới đây là cấu trúc đề xuất tương thích với các module admin khác trong project.

- **Base URL cho Admin Payment Method**
  - `GET /api/admin/payment-methods`
  - `POST /api/admin/payment-methods`
  - `GET /api/admin/payment-methods/:id`
  - `PUT /api/admin/payment-methods/:id`
  - `DELETE /api/admin/payment-methods/:id` (nếu hỗ trợ xoá mềm/cứng)

### 1. Lấy danh sách phương thức thanh toán

- **Endpoint**
  - `GET /api/admin/payment-methods`
- **Query params gợi ý**
  - `page` (number, optional, default 1).
  - `limit` (number, optional, default 20).
  - `status` (`active | inactive`, optional).
  - `type` (`online | offline`, optional).
- **Response mẫu**
  - `200 OK`
  - Body:
    - `items`: danh sách payment methods.
    - `meta`: paging (`page`, `limit`, `total`, `totalPages`).
- **Use-case FE**
  - Màn hình: `Danh sách phương thức thanh toán`.
  - Filter theo trạng thái, type, search theo name/code.

### 2. Tạo mới phương thức thanh toán

- **Endpoint**
  - `POST /api/admin/payment-methods`
- **Body (gợi ý DTO)**
  - `name`: string (bắt buộc).
  - `code`: string (bắt buộc, unique, viết hoa).
  - `type`: `online | offline` (bắt buộc).
  - `description`: string (optional).
  - `status`: `active | inactive` (optional, default `active`).
  - `config`: object (optional) – cấu hình chi tiết cho cổng thanh toán.
- **Response**
  - `201 Created` + object payment method vừa tạo.
- **Use-case FE**
  - Form "Thêm phương thức thanh toán":
    - Nhập tên, code, type, status.
    - Với `VNPAY`/cổng online: cho phép admin nhập thêm config JSON (hoặc form field) -> FE gửi lên field `config`.

### 3. Cập nhật phương thức thanh toán

- **Endpoint**
  - `PUT /api/admin/payment-methods/:id`
- **Body**
  - Các trường giống DTO tạo mới, tất cả optional trừ id param.
- **Luồng FE**
  - Màn "Sửa phương thức thanh toán":
    - Cho phép bật/tắt (`status`).
    - Cập nhật mô tả, config (API key, merchant code, v.v.).
  - Với `code`:
    - Nên khóa không cho đổi (đã dùng trong logic hệ thống), hoặc chỉ cho phép super admin chỉnh (tuỳ bạn implement ở controller/service).

### 4. Xem chi tiết phương thức thanh toán

- **Endpoint**
  - `GET /api/admin/payment-methods/:id`
- **Use-case**
  - FE mở trang chi tiết để hiển thị:
    - Thông tin chung.
    - Cấu hình (có thể mask một phần secret).
    - Trạng thái & type.

### 5. Bật/tắt phương thức thanh toán (toggle status)

- **Endpoint gợi ý**
  - `PUT /api/admin/payment-methods/:id/status`
- **Body**
  - `status`: `active | inactive`.
- **Use-case**
  - Trong list, admin bấm switch để enable/disable payment method mà không cần mở form full.
  - BE chỉ update trường `status`.

## Luồng tích hợp FE Admin

- **1. Sidebar & menu**
  - FE đọc cấu hình menu (tĩnh hoặc từ API `menus`), hiển thị mục:
    - `Ecommerce` (group).
    - Con: `Phương thức thanh toán` → route `/admin/ecommerce/payment-methods`.

- **2. Màn danh sách**
  - Khi vào `/admin/ecommerce/payment-methods`:
    - Gọi `GET /api/admin/payment-methods?page=1&limit=20`.
    - Render bảng:
      - Cột: Name, Code, Type, Status, CreatedAt, Actions.
    - Nút: Thêm mới, Filter theo status/type, ô tìm kiếm.

- **3. Thêm / Sửa**
  - Mở form (modal/page) với các field:
    - Tên (`name`), Mã (`code`), Loại (`type`), Trạng thái (`status`), Mô tả (`description`), Cấu hình (`config`).
  - Submit:
    - Thêm mới → `POST /api/admin/payment-methods`.
    - Cập nhật → `PUT /api/admin/payment-methods/:id`.
  - Sau khi success:
    - Đóng form, reload list (gọi lại `GET`).

- **4. Kết nối với luồng order**
  - FE phía checkout/public chỉ hiển thị những payment method:
    - `status = active`.
    - Type phù hợp với order (ví dụ: digital không cho COD → đã có `OrderValidationService.validatePaymentMethodForOrderType` xử lý).
  - Admin bật/tắt payment method ở đây sẽ ảnh hưởng trực tiếp đến danh sách lựa chọn ở FE khách hàng.

## Ghi chú triển khai backend

- **Permission**
  - Các endpoint admin cần guard:
    - `@Permission('payment_method.manage')`.
  - Có thể reuse `JwtAuthGuard` + RBAC decorator giống các module admin khác.
- **Validation**
  - DTO:
    - `code` uppercase, không khoảng trắng (có thể auto normalize ở service).
    - `type` phải là enum `PaymentType`.
    - `status` là enum `BasicStatus`.
  - `config` nên là `Record<string, any>` / `Json` để linh hoạt cho từng gateway.
- **Mở rộng sau**
  - Thêm các gateway khác: `MOMO`, `PAYOS`, … bằng cách thêm bản ghi mới qua admin UI.
  - Tạo tab "Logs/Transactions" liên kết sang bảng `payments` để xem thống kê theo phương thức thanh toán.


