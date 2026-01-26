# API Quản lý Gallery

Tài liệu tích hợp API quản lý gallery cho admin.

## Base URL

```
/admin/gallery
```

## Authentication

Tất cả các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer YOUR_TOKEN
```

## Endpoints

### 1. Tạo gallery mới

**POST** `/admin/gallery`

Tạo một gallery mới.

#### Request Body

```json
{
  "title": "Gallery ABC",                 // Bắt buộc - Tiêu đề gallery (tối đa 255 ký tự)
  "slug": "gallery-abc",                  // Tùy chọn - URL slug (nếu không có sẽ tự động sinh từ title)
  "description": "Mô tả gallery...",      // Tùy chọn - Mô tả
  "cover_image": "https://...",           // Tùy chọn - Ảnh bìa (tối đa 500 ký tự)
  "images": [                              // Bắt buộc - Mảng các URL ảnh (ít nhất 1 ảnh)
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ],
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
    "title": "Gallery ABC",
    "slug": "gallery-abc",
    "description": "Mô tả gallery...",
    "cover_image": "https://...",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg"
    ],
    "featured": false,
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Tạo gallery thành công"
}
```

#### Các trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `slug` - Tự động sinh từ `title` nếu không được cung cấp
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

### 2. Lấy danh sách gallery

**GET** `/admin/gallery`

Lấy danh sách gallery với phân trang và lọc.

#### Query Parameters

| Tham số | Loại | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) | `?page=1` |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) | `?limit=20` |
| `status` | string | Lọc theo trạng thái | `?status=active` |
| `featured` | boolean | Lọc theo nổi bật | `?featured=true` |
| `search` | string | Tìm kiếm theo tiêu đề | `?search=ABC` |
| `sortBy` | string | Sắp xếp theo trường | `?sortBy=created_at` |
| `sortOrder` | string | Thứ tự: ASC hoặc DESC | `?sortOrder=DESC` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Gallery ABC",
      "slug": "gallery-abc",
      "description": "Mô tả gallery...",
      "cover_image": "https://...",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
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

### 3. Lấy chi tiết gallery

**GET** `/admin/gallery/:id`

Lấy thông tin chi tiết một gallery.

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Gallery ABC",
    "slug": "gallery-abc",
    "description": "Mô tả gallery...",
    "cover_image": "https://...",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg"
    ],
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

### 4. Cập nhật gallery

**PUT** `/admin/gallery/:id`

Cập nhật thông tin gallery. Tất cả các trường đều tùy chọn, chỉ gửi các trường cần cập nhật.

#### Request Body

```json
{
  "title": "Gallery ABC Updated",
  "description": "Mô tả đã cập nhật...",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
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
    "title": "Gallery ABC Updated",
    "slug": "gallery-abc-updated",
    "description": "Mô tả đã cập nhật...",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "featured": true,
    "status": "active",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật gallery thành công"
}
```

---

### 5. Xóa gallery

**DELETE** `/admin/gallery/:id`

Xóa gallery (soft delete).

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Xóa gallery thành công"
}
```

---

## Tóm tắt các trường

### Trường bắt buộc khi tạo mới

- `title` - Tiêu đề gallery
- `images` - Mảng các URL ảnh (ít nhất 1 ảnh)

### Trường tùy chọn

- `slug` - URL slug (tự động sinh nếu không có)
- `description` - Mô tả
- `cover_image` - Ảnh bìa
- `featured` - Đánh dấu nổi bật (mặc định: false)
- `status` - Trạng thái (mặc định: active)
- `sort_order` - Thứ tự sắp xếp (mặc định: 0)

### Trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `slug` - Tự động sinh từ `title` nếu không được cung cấp
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

## Lưu ý khi tích hợp

1. **Slug tự động**: Nếu không gửi `slug`, hệ thống sẽ tự động tạo từ `title`. Nếu `slug` đã tồn tại, hệ thống sẽ tự động thêm số vào cuối để đảm bảo tính duy nhất.

2. **Mảng images**: `images` là mảng các URL chuỗi, bắt buộc phải có ít nhất 1 ảnh. Mảng này sẽ được lưu dưới dạng JSON trong database.

3. **Cover image**: Nếu không cung cấp `cover_image`, có thể sử dụng ảnh đầu tiên trong mảng `images` làm ảnh bìa.

4. **Status**: Chỉ có 2 giá trị: `active` (hoạt động) và `inactive` (không hoạt động).

5. **Soft delete**: Khi xóa, gallery sẽ được đánh dấu `deleted_at` thay vì xóa thực sự khỏi database.

6. **Phân trang**: Mặc định sắp xếp theo `sort_order` tăng dần, sau đó theo `created_at` giảm dần.

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy gallery |
| 409 | Conflict - Slug đã tồn tại |
| 422 | Unprocessable Entity - Validation error |

