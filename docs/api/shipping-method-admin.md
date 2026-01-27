## Tích hợp API quản lý phương thức vận chuyển (Admin)

- **Mục tiêu**
  - Cho phép admin quản lý danh sách phương thức vận chuyển (GHN, GHTK, Nội bộ, v.v.) qua API.
  - FE Admin có thể: xem danh sách, tạo mới, cập nhật, bật/tắt/khôi phục, xem chi tiết, xoá (soft delete).

## Cấu trúc & bảo mật

- **Base URL**: `http://localhost:3000/api`
- **Prefix module**: `admin/shipping-methods` (từ `@Controller('admin/shipping-methods')`)
- **Authentication**: JWT Bearer Token (bắt buộc)
- **Guards**:
  - `JwtAuthGuard`
  - `RbacGuard`
- **Permission bắt buộc**: `shipping_method.manage`
- **Headers chuẩn**:
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`

## Format Response chuẩn

Tất cả các API endpoint đều trả về response theo format chuẩn sau:

```json
{
  "success": boolean,
  "message": string,
  "code": string,
  "httpStatus": number,
  "data": T | null,
  "meta": object,
  "timestamp": string
}
```

**Giải thích các trường:**
- `success`: `true` nếu thành công, `false` nếu có lỗi
- `message`: Thông báo kết quả (VD: "Success", "Xóa thành công")
- `code`: Mã kết quả (VD: "SUCCESS", "ERROR")
- `httpStatus`: HTTP status code (200, 201, 400, 404, ...)
- `data`: Dữ liệu trả về (object, array, hoặc null)
- `meta`: Metadata bổ sung (thường là object rỗng `{}`, hoặc chứa pagination info nếu có)
- `timestamp`: Thời gian trả về response (format: `YYYY-MM-DDTHH:mm:ss+07:00`)

**Ví dụ response thành công:**
```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 2,
    "name": "Giao hàng nhanh",
    "code": "EXPRESS",
    "description": "Giao hàng trong 24-48h",
    "price": "60000",
    "status": "active",
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2026-01-27T16:00:51.000Z",
    "updated_at": "2026-01-27T17:27:43.000Z",
    "deleted_at": null
  },
  "meta": {},
  "timestamp": "2026-01-28T00:27:43+07:00"
}
```

---

## 1. Lấy danh sách phương thức vận chuyển

### Endpoint

- `GET /api/admin/shipping-methods`

### Query parameters

- Hỗ trợ chuẩn `prepareQuery`:
  - `page` (optional): số trang, mặc định 1.
  - `limit` (optional): số bản ghi mỗi trang, mặc định 20 (hoặc theo cấu hình chung).
  - `search` (optional): từ khoá tìm kiếm theo tên / code.
  - `status` (optional): lọc theo trạng thái (`active`, `inactive`, ... tùy enum `BasicStatus`).
  - `sort` (optional): chuỗi `field:direction`, ví dụ: `name:ASC`, `created_at:DESC`.

> Tham số thực tế có thể mở rộng tuỳ implement trong `prepareQuery`/`AdminShippingMethodService`.

### Response mẫu

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Giao hàng nhanh",
        "code": "EXPRESS",
        "description": "Giao hàng trong 24-48h",
        "price": "60000",
        "status": "active",
        "created_user_id": null,
        "updated_user_id": null,
        "created_at": "2025-01-11T05:00:00.000Z",
        "updated_at": "2025-01-11T05:00:00.000Z",
        "deleted_at": null
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  },
  "meta": {},
  "timestamp": "2026-01-28T00:27:43+07:00"
}
```

### Use-case FE

- Màn hình: **Danh sách phương thức vận chuyển**:
  - Bảng columns gợi ý: `Name`, `Code`, `Status`, `CreatedAt`, `UpdatedAt`, `Actions`.
  - Ô tìm kiếm theo tên/code, filter theo `status`.

---

## 2. Lấy danh sách đơn giản (simple list)

### Endpoint

- `GET /api/admin/shipping-methods/simple`

### Mục đích

- Trả về danh sách rút gọn (tuỳ logic service) để FE dùng cho dropdown, select (ít field hơn, limit nhỏ hơn).

### Use-case FE

- Popup chọn phương thức vận chuyển trong các màn hình khác (không phải list chính).

---

## 3. Lấy danh sách phương thức vận chuyển đang active

### Endpoint

- `GET /api/admin/shipping-methods/active`

### Hành vi

- Controller gọi:

```ts
return this.shippingMethodService.getList({
  status: BasicStatus.active,
  sort: 'name:ASC',
  limit: 1000
});
```

- Tức là:
  - Chỉ lấy `status = active`.
  - Sort theo `name ASC`.
  - Giới hạn tối đa 1000 bản ghi.

### Use-case FE

- Dùng để:
  - Hiển thị dropdown các phương thức đang bật (ví dụ trong cấu hình khác của hệ thống).
  - Không cần paging, trả về 1 lần tất cả các shipping methods active.

---

## 4. Lấy phương thức vận chuyển theo code

### Endpoint

- `GET /api/admin/shipping-methods/code/:code`

### Params

- `code`: string – mã duy nhất của shipping method (VD: `GHN`, `GHTK`, `INTERNAL`).

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 1,
    "name": "Giao hàng nhanh",
    "code": "EXPRESS",
    "description": "Giao hàng trong 24-48h",
    "price": "60000",
    "status": "active",
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "deleted_at": null
  },
  "meta": {},
  "timestamp": "2026-01-28T00:27:43+07:00"
}
```

### Use-case FE

- Các màn cấu hình nâng cao:
  - Lấy chi tiết phương thức theo `code` để map với cấu hình ngoài (ví dụ: mapping từ code trong system với code của provider bên thứ 3).

---

## 5. Lấy chi tiết 1 phương thức vận chuyển theo ID

### Endpoint

- `GET /api/admin/shipping-methods/:id`

### Params

- `id`: number (ParseIntPipe).

### Response mẫu

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 2,
    "name": "Giao hàng nhanh",
    "code": "EXPRESS",
    "description": "Giao hàng trong 24-48h",
    "price": "60000",
    "status": "active",
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2026-01-27T16:00:51.000Z",
    "updated_at": "2026-01-27T17:27:43.000Z",
    "deleted_at": null
  },
  "meta": {},
  "timestamp": "2026-01-28T00:27:43+07:00"
}
```

### Use-case FE

- Màn hình: **Chi tiết / Sửa phương thức vận chuyển**:
  - Khi vào route `/admin/ecommerce/shipping-methods/:id`, FE gọi endpoint này để load dữ liệu form.

---

## 6. Tạo mới phương thức vận chuyển

### Endpoint

- `POST /api/admin/shipping-methods`

### Request body (DTO `CreateShippingMethodDto`)

> Xem chi tiết DTO trong `src/modules/ecommerce/shipping-method/admin/dtos/create-shipping-method.dto.ts`.

```json
{
  "name": "Giao hàng nhanh",
  "code": "EXPRESS",
  "description": "Giao hàng trong 24-48h",
  "cost": 60000,
  "estimated_delivery_days": 2,
  "sort_order": 1
}
```

- **Fields**:
  - `name` (string, **required**): tên phương thức hiển thị.
  - `code` (string, **required**, unique): mã định danh, thường viết hoa (VD: `EXPRESS`, `STANDARD`).
  - `description` (string, optional): mô tả.
  - `cost` (number, optional): chi phí vận chuyển (sẽ map thành `price` trong DB).
  - `estimated_delivery_days` (number, optional): số ngày dự kiến giao hàng.
  - `sort_order` (number, optional): thứ tự sắp xếp.
  - `created_user_id` (number, optional): ID user tạo (thường tự động từ token).

### Response

**Success (201 Created):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 201,
  "data": {
    "id": 2,
    "name": "Giao hàng nhanh",
    "code": "EXPRESS",
    "description": "Giao hàng trong 24-48h",
    "price": "60000",
    "status": "active",
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2026-01-27T16:00:51.000Z",
    "updated_at": "2026-01-27T16:00:51.000Z",
    "deleted_at": null
  },
  "meta": {},
  "timestamp": "2026-01-28T00:27:43+07:00"
}
```

### Use-case FE

- Form "Thêm phương thức vận chuyển":
  - Khi submit, FE gọi `POST /api/admin/shipping-methods` với body như trên.
  - Nếu success: đóng modal và reload list (`GET /api/admin/shipping-methods`).

---

## 7. Cập nhật phương thức vận chuyển

### Endpoint

- `PUT /api/admin/shipping-methods/:id`

### Params

- `id`: number – ID của phương thức cần cập nhật.

### Request body (DTO `UpdateShippingMethodDto`)

- Các field giống `CreateShippingMethodDto`, **tất cả optional** (patch/update).

```json
{
  "name": "Giao hàng nhanh (cập nhật)",
  "description": "Giao hàng trong 24-48h - đã cập nhật",
  "cost": 70000,
  "status": "active",
  "estimated_delivery_days": 1,
  "sort_order": 2,
  "updated_user_id": 1
}
```

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 2,
    "name": "Giao hàng nhanh (cập nhật)",
    "code": "EXPRESS",
    "description": "Giao hàng trong 24-48h - đã cập nhật",
    "price": "70000",
    "status": "active",
    "created_user_id": null,
    "updated_user_id": 1,
    "created_at": "2026-01-27T16:00:51.000Z",
    "updated_at": "2026-01-27T17:27:43.000Z",
    "deleted_at": null
  },
  "meta": {},
  "timestamp": "2026-01-28T00:27:43+07:00"
}
```

### Use-case FE

- Màn "Sửa phương thức vận chuyển":
  - Cho phép bật/tắt, sửa tên, sửa mô tả, chỉnh sửa `config`.
  - **Khuyến nghị**: FE nên khoá `code` hoặc ẩn khỏi form (nếu system đã dùng `code` làm key logic).

---

## 8. Khôi phục (restore) phương thức vận chuyển

### Endpoint

- `PUT /api/admin/shipping-methods/:id/restore`

### Params

- `id`: number – ID bản ghi đã bị xoá mềm (soft delete).

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 5,
    "name": "Giao hàng nội bộ",
    "code": "INTERNAL",
    "description": "Giao hàng nội bộ",
    "price": "0",
    "status": "active",
    "created_user_id": null,
    "updated_user_id": null,
    "created_at": "2026-01-27T16:00:51.000Z",
    "updated_at": "2026-01-27T17:27:43.000Z",
    "deleted_at": null
  },
  "meta": {},
  "timestamp": "2026-01-28T00:27:43+07:00"
}
```

### Use-case FE

- Màn "Thùng rác" hoặc có filter `include_deleted`:
  - Cho phép admin khôi phục lại phương thức vận chuyển đã xoá.

---

## 9. Xoá phương thức vận chuyển

### Endpoint

- `DELETE /api/admin/shipping-methods/:id`

### Params

- `id`: number – ID cần xoá.

### Hành vi

- Dùng `shippingMethodService.delete(id)`:
  - Thường là **soft delete** (đánh dấu `deleted_at`), tuỳ base service.

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": null,
  "meta": {},
  "timestamp": "2026-01-28T00:27:43+07:00"
}
```

### Use-case FE

- Trong list:
  - Nút "Xoá" trên từng dòng.
  - Sau khi xoá thành công, FE:
    - Hoặc filter bỏ các item `deleted`.
    - Hoặc reload list từ backend.

---

## 10. Gợi ý tích hợp FE Admin

- **1. Màn danh sách**
  - Route gợi ý: `/admin/ecommerce/shipping-methods`.
  - Gọi `GET /api/admin/shipping-methods?page=1&limit=20`.
  - Chức năng:
    - Tìm kiếm, filter theo `status`.
    - Nút "Thêm mới".
    - Actions: Sửa, Xoá, (tuỳ UI có thêm Toggle status hay không).

- **2. Màn thêm / sửa**
  - Form các field:
    - `name` (required), `code` (required, chỉ cho nhập khi tạo mới), `description`, `cost` (number), `estimated_delivery_days`, `sort_order`, `status` (dropdown: active/inactive).
  - Submit:
    - Thêm mới → `POST /api/admin/shipping-methods`.
    - Cập nhật → `PUT /api/admin/shipping-methods/:id`.
  - **Lưu ý**: Field `cost` trong request sẽ được lưu thành `price` (Decimal) trong database.

- **3. Khôi phục / Thùng rác**
  - Nếu FE có filter `include_deleted`:
    - Hiển thị danh sách đã xoá, cho phép bấm "Khôi phục" → `PUT /api/admin/shipping-methods/:id/restore`.


