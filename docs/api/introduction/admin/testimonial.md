# API Quản lý Lời chứng thực (Testimonials)

Tài liệu tích hợp API quản lý lời chứng thực cho admin.

## Base URL

```
/admin/testimonials
```

## Authentication

Tất cả các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer YOUR_TOKEN
```

## Endpoints

### 1. Tạo lời chứng thực mới

**POST** `/admin/testimonials`

Tạo một lời chứng thực mới.

#### Request Body

```json
{
  "client_name": "Nguyễn Văn A",          // Bắt buộc - Tên khách hàng (tối đa 255 ký tự)
  "client_position": "Giám đốc",          // Tùy chọn - Chức vụ (tối đa 255 ký tự)
  "client_company": "Công ty XYZ",        // Tùy chọn - Công ty (tối đa 255 ký tự)
  "client_avatar": "https://...",         // Tùy chọn - Ảnh đại diện (tối đa 500 ký tự)
  "content": "Lời chứng thực...",         // Bắt buộc - Nội dung lời chứng thực
  "rating": 5,                            // Tùy chọn - Đánh giá (1-5, số nguyên)
  "project_id": 1,                        // Tùy chọn - ID dự án liên quan (số nguyên >= 1)
  "featured": false,                      // Tùy chọn - Đánh dấu nổi bật (mặc định: false)
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
    "client_name": "Nguyễn Văn A",
    "client_position": "Giám đốc",
    "client_company": "Công ty XYZ",
    "client_avatar": "https://...",
    "content": "Lời chứng thực...",
    "rating": 5,
    "project_id": "1",
    "featured": false,
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Tạo lời chứng thực thành công"
}
```

#### Các trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

### 2. Lấy danh sách lời chứng thực

**GET** `/admin/testimonials`

Lấy danh sách lời chứng thực với phân trang và lọc.

#### Query Parameters

| Tham số | Loại | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) | `?page=1` |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) | `?limit=20` |
| `status` | string | Lọc theo trạng thái | `?status=active` |
| `featured` | boolean | Lọc theo nổi bật | `?featured=true` |
| `project_id` | number | Lọc theo dự án | `?project_id=1` |
| `rating` | number | Lọc theo đánh giá | `?rating=5` |
| `search` | string | Tìm kiếm theo tên khách hàng | `?search=Nguyễn` |
| `sortBy` | string | Sắp xếp theo trường | `?sortBy=created_at` |
| `sortOrder` | string | Thứ tự: ASC hoặc DESC | `?sortOrder=DESC` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "client_name": "Nguyễn Văn A",
      "client_position": "Giám đốc",
      "client_company": "Công ty XYZ",
      "client_avatar": "https://...",
      "content": "Lời chứng thực...",
      "rating": 5,
      "project_id": "1",
      "featured": false,
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

### 3. Lấy chi tiết lời chứng thực

**GET** `/admin/testimonials/:id`

Lấy thông tin chi tiết một lời chứng thực.

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "client_name": "Nguyễn Văn A",
    "client_position": "Giám đốc",
    "client_company": "Công ty XYZ",
    "client_avatar": "https://...",
    "content": "Lời chứng thực...",
    "rating": 5,
    "project_id": "1",
    "featured": false,
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

---

### 4. Cập nhật lời chứng thực

**PUT** `/admin/testimonials/:id`

Cập nhật thông tin lời chứng thực. Tất cả các trường đều tùy chọn, chỉ gửi các trường cần cập nhật.

#### Request Body

```json
{
  "client_name": "Nguyễn Văn B",
  "content": "Lời chứng thực đã cập nhật...",
  "rating": 4,
  "featured": true,
  "status": "active"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "client_name": "Nguyễn Văn B",
    "content": "Lời chứng thực đã cập nhật...",
    "rating": 4,
    "featured": true,
    "status": "active",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật lời chứng thực thành công"
}
```

---

### 5. Xóa lời chứng thực

**DELETE** `/admin/testimonials/:id`

Xóa lời chứng thực (soft delete).

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Xóa lời chứng thực thành công"
}
```

---

### 6. Đánh dấu nổi bật

**PATCH** `/admin/testimonials/:id/featured`

Bật/tắt đánh dấu nổi bật cho lời chứng thực.

#### Request Body

```json
{
  "featured": true
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "featured": true,
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật trạng thái nổi bật thành công"
}
```

---

## Tóm tắt các trường

### Trường bắt buộc khi tạo mới

- `client_name` - Tên khách hàng
- `content` - Nội dung lời chứng thực

### Trường tùy chọn

- `client_position` - Chức vụ
- `client_company` - Công ty
- `client_avatar` - Ảnh đại diện
- `rating` - Đánh giá (1-5)
- `project_id` - ID dự án liên quan
- `featured` - Đánh dấu nổi bật (mặc định: false)
- `status` - Trạng thái (mặc định: active)
- `sort_order` - Thứ tự sắp xếp (mặc định: 0)

### Trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

## Lưu ý khi tích hợp

1. **Rating**: Đánh giá phải là số nguyên từ 1 đến 5. Nếu không cung cấp, có thể để null.

2. **Project ID**: Nếu lời chứng thực liên quan đến một dự án cụ thể, cung cấp `project_id`. Đảm bảo dự án đã tồn tại trong hệ thống.

3. **Featured**: Đánh dấu nổi bật để hiển thị ở các vị trí quan trọng trên website.

4. **Status**: Chỉ có 2 giá trị: `active` (hoạt động) và `inactive` (không hoạt động).

5. **Soft delete**: Khi xóa, lời chứng thực sẽ được đánh dấu `deleted_at` thay vì xóa thực sự khỏi database.

6. **Phân trang**: Mặc định sắp xếp theo `sort_order` tăng dần, sau đó theo `created_at` giảm dần.

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy lời chứng thực |
| 422 | Unprocessable Entity - Validation error |

