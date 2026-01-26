# API Quản lý Nhân viên (Staff)

Tài liệu tích hợp API quản lý nhân viên cho admin.

## Base URL

```
/admin/staff
```

## Authentication

Tất cả các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer YOUR_TOKEN
```

## Endpoints

### 1. Tạo nhân viên mới

**POST** `/admin/staff`

Tạo một nhân viên mới.

#### Request Body

```json
{
  "name": "Nguyễn Văn A",                 // Bắt buộc - Tên nhân viên (tối đa 255 ký tự)
  "position": "Giám đốc",                 // Bắt buộc - Chức vụ (tối đa 255 ký tự)
  "department": "Kỹ thuật",              // Tùy chọn - Phòng ban (tối đa 255 ký tự)
  "bio": "Tiểu sử nhân viên...",          // Tùy chọn - Tiểu sử
  "avatar": "https://...",                // Tùy chọn - Ảnh đại diện (tối đa 500 ký tự)
  "email": "nguyenvana@example.com",     // Tùy chọn - Email (tối đa 255 ký tự)
  "phone": "0123456789",                  // Tùy chọn - Số điện thoại (tối đa 20 ký tự)
  "social_links": {                       // Tùy chọn - Liên kết mạng xã hội (JSON object)
    "facebook": "https://facebook.com/...",
    "linkedin": "https://linkedin.com/...",
    "twitter": "https://twitter.com/..."
  },
  "experience": 5,                        // Tùy chọn - Số năm kinh nghiệm (số nguyên >= 0)
  "expertise": "Chuyên về thiết kế...",  // Tùy chọn - Chuyên môn
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
    "name": "Nguyễn Văn A",
    "position": "Giám đốc",
    "department": "Kỹ thuật",
    "bio": "Tiểu sử nhân viên...",
    "avatar": "https://...",
    "email": "nguyenvana@example.com",
    "phone": "0123456789",
    "social_links": {
      "facebook": "https://facebook.com/...",
      "linkedin": "https://linkedin.com/...",
      "twitter": "https://twitter.com/..."
    },
    "experience": 5,
    "expertise": "Chuyên về thiết kế...",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Tạo nhân viên thành công"
}
```

#### Các trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

### 2. Lấy danh sách nhân viên

**GET** `/admin/staff`

Lấy danh sách nhân viên với phân trang và lọc.

#### Query Parameters

| Tham số | Loại | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) | `?page=1` |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) | `?limit=20` |
| `status` | string | Lọc theo trạng thái | `?status=active` |
| `department` | string | Lọc theo phòng ban | `?department=Kỹ thuật` |
| `search` | string | Tìm kiếm theo tên | `?search=Nguyễn` |
| `sortBy` | string | Sắp xếp theo trường | `?sortBy=created_at` |
| `sortOrder` | string | Thứ tự: ASC hoặc DESC | `?sortOrder=DESC` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Nguyễn Văn A",
      "position": "Giám đốc",
      "department": "Kỹ thuật",
      "bio": "Tiểu sử nhân viên...",
      "avatar": "https://...",
      "email": "nguyenvana@example.com",
      "phone": "0123456789",
      "social_links": {
        "facebook": "https://facebook.com/..."
      },
      "experience": 5,
      "expertise": "Chuyên về thiết kế...",
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

### 3. Lấy chi tiết nhân viên

**GET** `/admin/staff/:id`

Lấy thông tin chi tiết một nhân viên.

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Nguyễn Văn A",
    "position": "Giám đốc",
    "department": "Kỹ thuật",
    "bio": "Tiểu sử nhân viên...",
    "avatar": "https://...",
    "email": "nguyenvana@example.com",
    "phone": "0123456789",
    "social_links": {
      "facebook": "https://facebook.com/...",
      "linkedin": "https://linkedin.com/..."
    },
    "experience": 5,
    "expertise": "Chuyên về thiết kế...",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

---

### 4. Cập nhật nhân viên

**PUT** `/admin/staff/:id`

Cập nhật thông tin nhân viên. Tất cả các trường đều tùy chọn, chỉ gửi các trường cần cập nhật.

#### Request Body

```json
{
  "name": "Nguyễn Văn A Updated",
  "position": "Phó Giám đốc",
  "department": "Marketing",
  "status": "inactive"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Nguyễn Văn A Updated",
    "position": "Phó Giám đốc",
    "department": "Marketing",
    "status": "inactive",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật nhân viên thành công"
}
```

---

### 5. Xóa nhân viên

**DELETE** `/admin/staff/:id`

Xóa nhân viên (soft delete).

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Xóa nhân viên thành công"
}
```

---

## Tóm tắt các trường

### Trường bắt buộc khi tạo mới

- `name` - Tên nhân viên
- `position` - Chức vụ

### Trường tùy chọn

- `department` - Phòng ban
- `bio` - Tiểu sử
- `avatar` - Ảnh đại diện
- `email` - Email
- `phone` - Số điện thoại
- `social_links` - Liên kết mạng xã hội (JSON object)
- `experience` - Số năm kinh nghiệm
- `expertise` - Chuyên môn
- `status` - Trạng thái (mặc định: active)
- `sort_order` - Thứ tự sắp xếp (mặc định: 0)

### Trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

## Lưu ý khi tích hợp

1. **Social Links**: `social_links` là một JSON object, có thể chứa các key như `facebook`, `linkedin`, `twitter`, `instagram`, v.v. với giá trị là URL.

2. **Experience**: Là số nguyên không âm, đại diện cho số năm kinh nghiệm.

3. **Status**: Chỉ có 2 giá trị: `active` (hoạt động) và `inactive` (không hoạt động).

4. **Soft delete**: Khi xóa, nhân viên sẽ được đánh dấu `deleted_at` thay vì xóa thực sự khỏi database.

5. **Phân trang**: Mặc định sắp xếp theo `sort_order` tăng dần, sau đó theo `created_at` giảm dần.

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy nhân viên |
| 422 | Unprocessable Entity - Validation error |

