# Admin Content Templates API

Chi tiết các endpoint quản lý mẫu nội dung dành cho Admin.

**Base Path:** `/admin/content-templates`

---

## 1. Lấy danh sách Templates

Lấy danh sách các mẫu nội dung có phân trang và tìm kiếm.

- **Method:** `GET`
- **Path:** `/admin/content-templates`
- **Query Parameters:**
  - `page` (optional, number): Trang hiện tại (mặc định: 1)
  - `limit` (optional, number): Số lượng trên mỗi trang (mặc định: 10, max: 100)
  - `search` (optional, string): Tìm kiếm theo tên hoặc mã code
  - `category` (optional, enum): Lọc theo `render` \| `file`
  - `type` (optional, enum): Lọc theo `email` \| `telegram` \| `zalo` \| `sms` \| v.v.
  - `status` (optional, enum): Lọc theo `active` \| `inactive`

### Response Example:

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "registration_success",
      "name": "Đăng ký thành công",
      "category": "render",
      "type": "email",
      "status": "active",
      "created_at": "2026-01-26T15:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 2. Chi tiết Template

Lấy toàn bộ thông tin của một mẫu nội dung.

- **Method:** `GET`
- **Path:** `/admin/content-templates/:id`

### Response Example:

```json
{
  "success": true,
  "data": {
    "id": "1",
    "code": "registration_success",
    "name": "Đăng ký thành công",
    "content": "<h2>Chào mừng {{name}}</h2>...",
    "category": "render",
    "type": "email",
    "metadata": {
      "subject": "Chào mừng bạn mới"
    },
    "variables": ["name", "email", "loginUrl"],
    "status": "active",
    "created_at": "2026-01-26T15:00:00Z",
    "updated_at": "2026-01-26T15:10:00Z"
  }
}
```

---

## 3. Tạo mới Template

- **Method:** `POST`
- **Path:** `/admin/content-templates`
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Mã duy nhất (Max 100 ký tự) |
| `name` | string | Yes | Tên mẫu (Max 255 ký tự) |
| `category` | enum | Yes | `render` \| `file` |
| `type` | enum | Yes | `email` \| `telegram` \| `zalo` \| `sms` \| `pdf_generated` \| `file_word` \| `file_excel` \| `file_pdf` |
| `content` | string | No | Nội dung (Dành cho loại `render`) |
| `file_path` | string | No | Đường dẫn file (Dành cho loại `file`) |
| `metadata` | object | No | Cấu hình bổ sung (Subject, Title, params...) |
| `variables` | array/object| No | Danh sách các biến sử dụng |
| `status` | enum | No | `active` (mặc định) \| `inactive` |

### Request Body Example:

```json
{
  "code": "reset_password",
  "name": "Quên mật khẩu",
  "category": "render",
  "type": "email",
  "content": "Mã OTP của bạn là: {{otp}}",
  "metadata": {
    "subject": "Yêu cầu khôi phục mật khẩu"
  },
  "variables": ["otp"]
}
```

---

## 4. Cập nhật Template

Cập nhật thông tin mẫu nội dung hiện có.

- **Method:** `PATCH`
- **Path:** `/admin/content-templates/:id`
- **Body:** (Tương tự Create, tất cả các trường là optional)

---

## 5. Xóa Template

Xóa mềm mẫu nội dung.

- **Method:** `DELETE`
- **Path:** `/admin/content-templates/:id`

---

## 6. Chạy thử Template (Test Execution)

Dùng để kiểm tra xem template có parse biến và gửi đi đúng không.

- **Method:** `POST`
- **Path:** `/admin/content-templates/:code/test`
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Người nhận (Email/Phone/ChatID...) |
| `variables` | object | Yes | Key-value các biến cần truyền vào |

### Request Body Example:

```json
{
  "to": "test@example.com",
  "variables": {
    "name": "Admin Test",
    "otp": "999999"
  }
}
```

### Response Example:

```json
{
  "success": true,
  "data": {
    "success": true,
    "channel": "email"
  }
}
```
