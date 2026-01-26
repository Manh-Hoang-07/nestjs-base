# API Quản lý Dự án (Projects)

Tài liệu tích hợp API quản lý dự án cho admin.

## Base URL

```
/admin/projects
```

## Authentication

Tất cả các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer YOUR_TOKEN
```

## Endpoints

### 1. Tạo dự án mới

**POST** `/admin/projects`

Tạo một dự án mới.

#### Request Body

```json
{
  "name": "Dự án ABC",                    // Bắt buộc - Tên dự án (tối đa 255 ký tự)
  "slug": "du-an-abc",                    // Tùy chọn - URL slug (nếu không có sẽ tự động sinh từ name)
  "description": "Mô tả chi tiết...",     // Tùy chọn - Mô tả đầy đủ
  "short_description": "Mô tả ngắn...",   // Tùy chọn - Mô tả ngắn (tối đa 500 ký tự)
  "cover_image": "https://...",           // Tùy chọn - Ảnh bìa (tối đa 500 ký tự)
  "location": "Hà Nội",                   // Tùy chọn - Địa điểm (tối đa 255 ký tự)
  "area": 1000.5,                         // Tùy chọn - Diện tích (số thập phân)
  "start_date": "2024-01-01T00:00:00Z",   // Tùy chọn - Ngày bắt đầu (ISO 8601)
  "end_date": "2024-12-31T00:00:00Z",    // Tùy chọn - Ngày kết thúc (ISO 8601)
  "status": "planning",                   // Tùy chọn - Trạng thái: planning, in_progress, completed, cancelled (mặc định: planning)
  "client_name": "Công ty XYZ",          // Tùy chọn - Tên khách hàng (tối đa 255 ký tự)
  "budget": 5000000000,                  // Tùy chọn - Ngân sách (số thập phân)
  "images": [                             // Tùy chọn - Mảng các URL ảnh
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "featured": false,                      // Tùy chọn - Đánh dấu nổi bật (mặc định: false)
  "sort_order": 0,                       // Tùy chọn - Thứ tự sắp xếp (mặc định: 0)
  "meta_title": "SEO Title",              // Tùy chọn - Tiêu đề SEO (tối đa 255 ký tự)
  "meta_description": "SEO Description",  // Tùy chọn - Mô tả SEO
  "canonical_url": "https://...",         // Tùy chọn - URL canonical (tối đa 500 ký tự)
  "og_image": "https://..."               // Tùy chọn - Ảnh Open Graph (tối đa 500 ký tự)
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Dự án ABC",
    "slug": "du-an-abc",
    "description": "Mô tả chi tiết...",
    "short_description": "Mô tả ngắn...",
    "cover_image": "https://...",
    "location": "Hà Nội",
    "area": "1000.50",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T00:00:00.000Z",
    "status": "planning",
    "client_name": "Công ty XYZ",
    "budget": "5000000000.00",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "featured": false,
    "view_count": "0",
    "sort_order": 0,
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "canonical_url": "https://...",
    "og_image": "https://...",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Tạo dự án thành công"
}
```

#### Các trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `slug` - Tự động sinh từ `name` nếu không được cung cấp
- `view_count` - Mặc định 0, tự động tăng khi có lượt xem
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

### 2. Lấy danh sách dự án

**GET** `/admin/projects`

Lấy danh sách dự án với phân trang và lọc.

#### Query Parameters

| Tham số | Loại | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) | `?page=1` |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) | `?limit=20` |
| `status` | string | Lọc theo trạng thái | `?status=completed` |
| `featured` | boolean | Lọc theo nổi bật | `?featured=true` |
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
      "name": "Dự án ABC",
      "slug": "du-an-abc",
      "description": "Mô tả chi tiết...",
      "short_description": "Mô tả ngắn...",
      "cover_image": "https://...",
      "location": "Hà Nội",
      "area": "1000.50",
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-12-31T00:00:00.000Z",
      "status": "planning",
      "client_name": "Công ty XYZ",
      "budget": "5000000000.00",
      "images": ["https://example.com/image1.jpg"],
      "featured": false,
      "view_count": "0",
      "sort_order": 0,
      "meta_title": "SEO Title",
      "meta_description": "SEO Description",
      "canonical_url": "https://...",
      "og_image": "https://...",
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

### 3. Lấy chi tiết dự án

**GET** `/admin/projects/:id`

Lấy thông tin chi tiết một dự án.

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Dự án ABC",
    "slug": "du-an-abc",
    "description": "Mô tả chi tiết...",
    "short_description": "Mô tả ngắn...",
    "cover_image": "https://...",
    "location": "Hà Nội",
    "area": "1000.50",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T00:00:00.000Z",
    "status": "planning",
    "client_name": "Công ty XYZ",
    "budget": "5000000000.00",
    "images": ["https://example.com/image1.jpg"],
    "featured": false,
    "view_count": "0",
    "sort_order": 0,
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "canonical_url": "https://...",
    "og_image": "https://...",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

---

### 4. Cập nhật dự án

**PUT** `/admin/projects/:id`

Cập nhật thông tin dự án. Tất cả các trường đều tùy chọn, chỉ gửi các trường cần cập nhật.

#### Request Body

```json
{
  "name": "Dự án ABC Updated",
  "description": "Mô tả đã cập nhật...",
  "status": "in_progress",
  "featured": true
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Dự án ABC Updated",
    "slug": "du-an-abc-updated",
    "description": "Mô tả đã cập nhật...",
    "status": "in_progress",
    "featured": true,
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật dự án thành công"
}
```

---

### 5. Xóa dự án

**DELETE** `/admin/projects/:id`

Xóa dự án (soft delete).

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Xóa dự án thành công"
}
```

---

### 6. Thay đổi trạng thái dự án

**PATCH** `/admin/projects/:id/status`

Thay đổi trạng thái dự án.

#### Request Body

```json
{
  "status": "completed"
}
```

#### Trạng thái hợp lệ

- `planning` - Đang lên kế hoạch
- `in_progress` - Đang thực hiện
- `completed` - Hoàn thành
- `cancelled` - Đã hủy

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "status": "completed",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật trạng thái thành công"
}
```

---

### 7. Đánh dấu nổi bật

**PATCH** `/admin/projects/:id/featured`

Bật/tắt đánh dấu nổi bật cho dự án.

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

### 8. Cập nhật thứ tự sắp xếp

**PATCH** `/admin/projects/:id/sort-order`

Cập nhật thứ tự sắp xếp của dự án.

#### Request Body

```json
{
  "sort_order": 5
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "sort_order": 5,
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật thứ tự sắp xếp thành công"
}
```

---

## Tóm tắt các trường

### Trường bắt buộc khi tạo mới

- `name` - Tên dự án

### Trường tùy chọn

- `slug` - URL slug (tự động sinh nếu không có)
- `description` - Mô tả đầy đủ
- `short_description` - Mô tả ngắn (tối đa 500 ký tự)
- `cover_image` - Ảnh bìa
- `location` - Địa điểm
- `area` - Diện tích
- `start_date` - Ngày bắt đầu
- `end_date` - Ngày kết thúc
- `status` - Trạng thái (mặc định: planning)
- `client_name` - Tên khách hàng
- `budget` - Ngân sách
- `images` - Mảng các URL ảnh
- `featured` - Đánh dấu nổi bật (mặc định: false)
- `sort_order` - Thứ tự sắp xếp (mặc định: 0)
- `meta_title` - Tiêu đề SEO
- `meta_description` - Mô tả SEO
- `canonical_url` - URL canonical
- `og_image` - Ảnh Open Graph

### Trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `slug` - Tự động sinh từ `name` nếu không được cung cấp
- `view_count` - Mặc định 0
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

## Lưu ý khi tích hợp

1. **Slug tự động**: Nếu không gửi `slug`, hệ thống sẽ tự động tạo từ `name`. Nếu `slug` đã tồn tại, hệ thống sẽ tự động thêm số vào cuối để đảm bảo tính duy nhất.

2. **Format ngày tháng**: Sử dụng định dạng ISO 8601 cho `start_date` và `end_date` (ví dụ: `2024-01-01T00:00:00Z`).

3. **Số thập phân**: `area` và `budget` là số thập phân, có thể gửi dưới dạng số hoặc chuỗi.

4. **Mảng images**: `images` là mảng các URL chuỗi, sẽ được lưu dưới dạng JSON trong database.

5. **Soft delete**: Khi xóa, dự án sẽ được đánh dấu `deleted_at` thay vì xóa thực sự khỏi database.

6. **Phân trang**: Mặc định sắp xếp theo `sort_order` tăng dần, sau đó theo `created_at` giảm dần.

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy dự án |
| 409 | Conflict - Slug đã tồn tại |
| 422 | Unprocessable Entity - Validation error |

