# API Quản lý Chứng chỉ (Certificates)

Tài liệu tích hợp API quản lý chứng chỉ cho admin.

## Base URL

```
/admin/certificates
```

## Authentication

Tất cả các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer YOUR_TOKEN
```

## Endpoints

### 1. Tạo chứng chỉ mới

**POST** `/admin/certificates`

Tạo một chứng chỉ mới.

#### Request Body

```json
{
  "name": "Chứng chỉ ISO 9001",           // Bắt buộc - Tên chứng chỉ (tối đa 255 ký tự)
  "image": "https://...",                 // Bắt buộc - Ảnh chứng chỉ (tối đa 500 ký tự)
  "issued_by": "Tổ chức ABC",             // Tùy chọn - Cơ quan cấp (tối đa 255 ký tự)
  "issued_date": "2024-01-01T00:00:00Z", // Tùy chọn - Ngày cấp (ISO 8601)
  "expiry_date": "2025-01-01T00:00:00Z", // Tùy chọn - Ngày hết hạn (ISO 8601)
  "certificate_number": "ISO-2024-001",  // Tùy chọn - Số chứng chỉ (tối đa 100 ký tự)
  "description": "Mô tả chứng chỉ...",   // Tùy chọn - Mô tả
  "type": "iso",                          // Tùy chọn - Loại: iso, award, license, certification, other (mặc định: license)
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
    "name": "Chứng chỉ ISO 9001",
    "image": "https://...",
    "issued_by": "Tổ chức ABC",
    "issued_date": "2024-01-01T00:00:00.000Z",
    "expiry_date": "2025-01-01T00:00:00.000Z",
    "certificate_number": "ISO-2024-001",
    "description": "Mô tả chứng chỉ...",
    "type": "iso",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Tạo chứng chỉ thành công"
}
```

#### Các trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

### 2. Lấy danh sách chứng chỉ

**GET** `/admin/certificates`

Lấy danh sách chứng chỉ với phân trang và lọc.

#### Query Parameters

| Tham số | Loại | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) | `?page=1` |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) | `?limit=20` |
| `status` | string | Lọc theo trạng thái | `?status=active` |
| `type` | string | Lọc theo loại | `?type=iso` |
| `search` | string | Tìm kiếm theo tên | `?search=ISO` |
| `sortBy` | string | Sắp xếp theo trường | `?sortBy=created_at` |
| `sortOrder` | string | Thứ tự: ASC hoặc DESC | `?sortOrder=DESC` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Chứng chỉ ISO 9001",
      "image": "https://...",
      "issued_by": "Tổ chức ABC",
      "issued_date": "2024-01-01T00:00:00.000Z",
      "expiry_date": "2025-01-01T00:00:00.000Z",
      "certificate_number": "ISO-2024-001",
      "description": "Mô tả chứng chỉ...",
      "type": "iso",
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

### 3. Lấy chi tiết chứng chỉ

**GET** `/admin/certificates/:id`

Lấy thông tin chi tiết một chứng chỉ.

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Chứng chỉ ISO 9001",
    "image": "https://...",
    "issued_by": "Tổ chức ABC",
    "issued_date": "2024-01-01T00:00:00.000Z",
    "expiry_date": "2025-01-01T00:00:00.000Z",
    "certificate_number": "ISO-2024-001",
    "description": "Mô tả chứng chỉ...",
    "type": "iso",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

---

### 4. Cập nhật chứng chỉ

**PUT** `/admin/certificates/:id`

Cập nhật thông tin chứng chỉ. Tất cả các trường đều tùy chọn, chỉ gửi các trường cần cập nhật.

#### Request Body

```json
{
  "name": "Chứng chỉ ISO 9001 Updated",
  "image": "https://new-image.com/cert.jpg",
  "issued_date": "2024-02-01T00:00:00Z",
  "expiry_date": "2025-02-01T00:00:00Z",
  "status": "active"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Chứng chỉ ISO 9001 Updated",
    "image": "https://new-image.com/cert.jpg",
    "issued_date": "2024-02-01T00:00:00.000Z",
    "expiry_date": "2025-02-01T00:00:00.000Z",
    "status": "active",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật chứng chỉ thành công"
}
```

---

### 5. Xóa chứng chỉ

**DELETE** `/admin/certificates/:id`

Xóa chứng chỉ (soft delete).

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Xóa chứng chỉ thành công"
}
```

---

## Tóm tắt các trường

### Trường bắt buộc khi tạo mới

- `name` - Tên chứng chỉ
- `image` - Ảnh chứng chỉ (URL)

### Trường tùy chọn

- `issued_by` - Cơ quan cấp
- `issued_date` - Ngày cấp (ISO 8601)
- `expiry_date` - Ngày hết hạn (ISO 8601)
- `certificate_number` - Số chứng chỉ
- `description` - Mô tả
- `type` - Loại chứng chỉ (mặc định: license)
  - `iso` - ISO
  - `award` - Giải thưởng
  - `license` - Giấy phép
  - `certification` - Chứng nhận
  - `other` - Khác
- `status` - Trạng thái (mặc định: active)
- `sort_order` - Thứ tự sắp xếp (mặc định: 0)

### Trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

## Lưu ý khi tích hợp

1. **Image**: Ảnh chứng chỉ phải là URL hợp lệ, thường là đường dẫn đến file ảnh đã được upload lên server.

2. **Format ngày tháng**: Sử dụng định dạng ISO 8601 cho `issued_date` và `expiry_date` (ví dụ: `2024-01-01T00:00:00Z`).

3. **Type**: Có 5 loại chứng chỉ:
   - `iso` - ISO
   - `award` - Giải thưởng
   - `license` - Giấy phép
   - `certification` - Chứng nhận
   - `other` - Khác

4. **Status**: Chỉ có 2 giá trị: `active` (hoạt động) và `inactive` (không hoạt động).

5. **Soft delete**: Khi xóa, chứng chỉ sẽ được đánh dấu `deleted_at` thay vì xóa thực sự khỏi database.

6. **Phân trang**: Mặc định sắp xếp theo `sort_order` tăng dần, sau đó theo `created_at` giảm dần.

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy chứng chỉ |
| 422 | Unprocessable Entity - Validation error |

