# API Quản lý Phần Giới thiệu (About Sections)

Tài liệu tích hợp API quản lý phần giới thiệu cho admin.

## Base URL

```
/admin/about-sections
```

## Authentication

Tất cả các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer YOUR_TOKEN
```

## Endpoints

### 1. Tạo phần giới thiệu mới

**POST** `/admin/about-sections`

Tạo một phần giới thiệu mới.

#### Request Body

```json
{
  "title": "Lịch sử công ty",             // Bắt buộc - Tiêu đề (tối đa 255 ký tự)
  "slug": "lich-su-cong-ty",              // Tùy chọn - URL slug (nếu không có sẽ tự động sinh từ title)
  "content": "Nội dung phần giới thiệu...", // Bắt buộc - Nội dung
  "image": "https://...",                 // Tùy chọn - Ảnh (tối đa 500 ký tự)
  "video_url": "https://youtube.com/...", // Tùy chọn - URL video (tối đa 500 ký tự)
  "section_type": "history",              // Tùy chọn - Loại: history, mission, vision, values, culture, achievement, other (mặc định: history)
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
    "title": "Lịch sử công ty",
    "slug": "lich-su-cong-ty",
    "content": "Nội dung phần giới thiệu...",
    "image": "https://...",
    "video_url": "https://youtube.com/...",
    "section_type": "history",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Tạo phần giới thiệu thành công"
}
```

#### Các trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `slug` - Tự động sinh từ `title` nếu không được cung cấp
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

### 2. Lấy danh sách phần giới thiệu

**GET** `/admin/about-sections`

Lấy danh sách phần giới thiệu với phân trang và lọc.

#### Query Parameters

| Tham số | Loại | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) | `?page=1` |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) | `?limit=20` |
| `status` | string | Lọc theo trạng thái | `?status=active` |
| `section_type` | string | Lọc theo loại | `?section_type=history` |
| `search` | string | Tìm kiếm theo tiêu đề | `?search=Lịch sử` |
| `sortBy` | string | Sắp xếp theo trường | `?sortBy=created_at` |
| `sortOrder` | string | Thứ tự: ASC hoặc DESC | `?sortOrder=DESC` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Lịch sử công ty",
      "slug": "lich-su-cong-ty",
      "content": "Nội dung phần giới thiệu...",
      "image": "https://...",
      "video_url": "https://youtube.com/...",
      "section_type": "history",
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

### 3. Lấy chi tiết phần giới thiệu

**GET** `/admin/about-sections/:id`

Lấy thông tin chi tiết một phần giới thiệu.

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Lịch sử công ty",
    "slug": "lich-su-cong-ty",
    "content": "Nội dung phần giới thiệu...",
    "image": "https://...",
    "video_url": "https://youtube.com/...",
    "section_type": "history",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

---

### 4. Cập nhật phần giới thiệu

**PUT** `/admin/about-sections/:id`

Cập nhật thông tin phần giới thiệu. Tất cả các trường đều tùy chọn, chỉ gửi các trường cần cập nhật.

#### Request Body

```json
{
  "title": "Lịch sử công ty Updated",
  "content": "Nội dung đã cập nhật...",
  "section_type": "mission",
  "status": "active"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Lịch sử công ty Updated",
    "slug": "lich-su-cong-ty-updated",
    "content": "Nội dung đã cập nhật...",
    "section_type": "mission",
    "status": "active",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật phần giới thiệu thành công"
}
```

---

### 5. Xóa phần giới thiệu

**DELETE** `/admin/about-sections/:id`

Xóa phần giới thiệu (soft delete).

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Xóa phần giới thiệu thành công"
}
```

---

## Tóm tắt các trường

### Trường bắt buộc khi tạo mới

- `title` - Tiêu đề
- `content` - Nội dung

### Trường tùy chọn

- `slug` - URL slug (tự động sinh nếu không có)
- `image` - Ảnh
- `video_url` - URL video
- `section_type` - Loại phần giới thiệu (mặc định: history)
  - `history` - Lịch sử
  - `mission` - Sứ mệnh
  - `vision` - Tầm nhìn
  - `values` - Giá trị cốt lõi
  - `culture` - Văn hóa
  - `achievement` - Thành tựu
  - `other` - Khác
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

2. **Content**: Nội dung có thể chứa HTML hoặc text thuần, tùy thuộc vào cách hiển thị trên frontend.

3. **Section Type**: Có 7 loại phần giới thiệu:
   - `history` - Lịch sử
   - `mission` - Sứ mệnh
   - `vision` - Tầm nhìn
   - `values` - Giá trị cốt lõi
   - `culture` - Văn hóa
   - `achievement` - Thành tựu
   - `other` - Khác

4. **Video URL**: Có thể là URL YouTube, Vimeo hoặc bất kỳ URL video nào khác.

5. **Status**: Chỉ có 2 giá trị: `active` (hoạt động) và `inactive` (không hoạt động).

6. **Soft delete**: Khi xóa, phần giới thiệu sẽ được đánh dấu `deleted_at` thay vì xóa thực sự khỏi database.

7. **Phân trang**: Mặc định sắp xếp theo `sort_order` tăng dần, sau đó theo `created_at` giảm dần.

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy phần giới thiệu |
| 409 | Conflict - Slug đã tồn tại |
| 422 | Unprocessable Entity - Validation error |

