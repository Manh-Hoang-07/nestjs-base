# API Quản lý Đối tác (Partners)

Tài liệu tích hợp API quản lý đối tác cho admin.

## Base URL

```
/admin/partners
```

## Authentication

Tất cả các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer YOUR_TOKEN
```

## Endpoints

### 1. Tạo đối tác mới

**POST** `/admin/partners`

Tạo một đối tác mới.

#### Request Body

```json
{
  "name": "Công ty ABC",                  // Bắt buộc - Tên đối tác (tối đa 255 ký tự)
  "logo": "https://...",                  // Bắt buộc - Logo đối tác (tối đa 500 ký tự)
  "website": "https://example.com",      // Tùy chọn - Website (URL hợp lệ, tối đa 500 ký tự)
  "description": "Mô tả đối tác...",     // Tùy chọn - Mô tả
  "type": "client",                       // Tùy chọn - Loại: client, supplier, partner (mặc định: client)
  "status": "active",                     // Tùy chọn - Trạng thái: active, inactive (mặc định: active)
  "sort_order": 0                         // Tùy chọn - Thứ tự sắp xếp (mặc định: 0)
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Công ty ABC",
    "logo": "https://...",
    "website": "https://example.com",
    "description": "Mô tả đối tác...",
    "type": "client",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Tạo đối tác thành công"
}
```

#### Các trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

### 2. Lấy danh sách đối tác

**GET** `/admin/partners`

Lấy danh sách đối tác với phân trang và lọc.

#### Query Parameters

| Tham số | Loại | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) | `?page=1` |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) | `?limit=20` |
| `status` | string | Lọc theo trạng thái | `?status=active` |
| `type` | string | Lọc theo loại | `?type=client` |
| `search` | string | Tìm kiếm theo tên | `?search=ABC` |
| `sortBy` | string | Sắp xếp theo trường | `?sortBy=created_at` |
| `sortOrder` | string | Thứ tự: ASC hoặc DESC | `?sortOrder=DESC` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Công ty ABC",
      "logo": "https://...",
      "website": "https://example.com",
      "description": "Mô tả đối tác...",
      "type": "client",
      "status": "active",
      "sort_order": 0,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "deleted_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### 3. Lấy chi tiết đối tác

**GET** `/admin/partners/:id`

Lấy thông tin chi tiết một đối tác.

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Công ty ABC",
    "logo": "https://...",
    "website": "https://example.com",
    "description": "Mô tả đối tác...",
    "type": "client",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

---

### 4. Cập nhật đối tác

**PUT** `/admin/partners/:id`

Cập nhật thông tin đối tác. Tất cả các trường đều tùy chọn, chỉ gửi các trường cần cập nhật.

#### Request Body

```json
{
  "name": "Công ty ABC Updated",
  "logo": "https://new-logo.com/logo.png",
  "website": "https://newwebsite.com",
  "type": "partner",
  "status": "active"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Công ty ABC Updated",
    "logo": "https://new-logo.com/logo.png",
    "website": "https://newwebsite.com",
    "type": "partner",
    "status": "active",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật đối tác thành công"
}
```

---

### 5. Xóa đối tác

**DELETE** `/admin/partners/:id`

Xóa đối tác (soft delete).

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Xóa đối tác thành công"
}
```

---

## Tóm tắt các trường

### Trường bắt buộc khi tạo mới

- `name` - Tên đối tác
- `logo` - Logo đối tác (URL)

### Trường tùy chọn

- `website` - Website (URL hợp lệ)
- `description` - Mô tả
- `type` - Loại đối tác (mặc định: client)
  - `client` - Khách hàng
  - `supplier` - Nhà cung cấp
  - `partner` - Đối tác
- `status` - Trạng thái (mặc định: active)
- `sort_order` - Thứ tự sắp xếp (mặc định: 0)

### Trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

## Lưu ý khi tích hợp

1. **Logo**: Logo phải là URL hợp lệ, thường là đường dẫn đến file ảnh đã được upload lên server.

2. **Website**: Nếu cung cấp, phải là URL hợp lệ (bắt đầu với `http://` hoặc `https://`).

3. **Type**: Có 3 loại đối tác:
   - `client` - Khách hàng
   - `supplier` - Nhà cung cấp
   - `partner` - Đối tác

4. **Status**: Chỉ có 2 giá trị: `active` (hoạt động) và `inactive` (không hoạt động).

5. **Soft delete**: Khi xóa, đối tác sẽ được đánh dấu `deleted_at` thay vì xóa thực sự khỏi database.

6. **Phân trang**: Mặc định sắp xếp theo `sort_order` tăng dần, sau đó theo `created_at` giảm dần.

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy đối tác |
| 422 | Unprocessable Entity - Validation error |

