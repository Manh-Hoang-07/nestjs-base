# API Quản lý Câu hỏi thường gặp (FAQs)

Tài liệu tích hợp API quản lý FAQ cho admin.

## Base URL

```
/admin/faqs
```

## Authentication

Tất cả các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer YOUR_TOKEN
```

## Endpoints

### 1. Tạo FAQ mới

**POST** `/admin/faqs`

Tạo một FAQ mới.

#### Request Body

```json
{
  "question": "Câu hỏi thường gặp?",      // Bắt buộc - Câu hỏi
  "answer": "Câu trả lời chi tiết...",     // Bắt buộc - Câu trả lời
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
    "question": "Câu hỏi thường gặp?",
    "answer": "Câu trả lời chi tiết...",
    "view_count": "0",
    "helpful_count": "0",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  },
  "message": "Tạo FAQ thành công"
}
```

#### Các trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `view_count` - Mặc định 0, tự động tăng khi có lượt xem
- `helpful_count` - Mặc định 0, tự động tăng khi người dùng đánh dấu hữu ích
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

### 2. Lấy danh sách FAQ

**GET** `/admin/faqs`

Lấy danh sách FAQ với phân trang và lọc.

#### Query Parameters

| Tham số | Loại | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `page` | number | Trang hiện tại (mặc định: 1) | `?page=1` |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) | `?limit=20` |
| `status` | string | Lọc theo trạng thái | `?status=active` |
| `search` | string | Tìm kiếm theo câu hỏi hoặc câu trả lời | `?search=thường gặp` |
| `sortBy` | string | Sắp xếp theo trường | `?sortBy=view_count` |
| `sortOrder` | string | Thứ tự: ASC hoặc DESC | `?sortOrder=DESC` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "question": "Câu hỏi thường gặp?",
      "answer": "Câu trả lời chi tiết...",
      "view_count": "10",
      "helpful_count": "5",
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

### 3. Lấy chi tiết FAQ

**GET** `/admin/faqs/:id`

Lấy thông tin chi tiết một FAQ.

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "question": "Câu hỏi thường gặp?",
    "answer": "Câu trả lời chi tiết...",
    "view_count": "10",
    "helpful_count": "5",
    "status": "active",
    "sort_order": 0,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

---

### 4. Cập nhật FAQ

**PUT** `/admin/faqs/:id`

Cập nhật thông tin FAQ. Tất cả các trường đều tùy chọn, chỉ gửi các trường cần cập nhật.

#### Request Body

```json
{
  "question": "Câu hỏi đã cập nhật?",
  "answer": "Câu trả lời đã cập nhật...",
  "status": "active",
  "sort_order": 5
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "question": "Câu hỏi đã cập nhật?",
    "answer": "Câu trả lời đã cập nhật...",
    "status": "active",
    "sort_order": 5,
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Cập nhật FAQ thành công"
}
```

---

### 5. Xóa FAQ

**DELETE** `/admin/faqs/:id`

Xóa FAQ (soft delete).

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Xóa FAQ thành công"
}
```

---

## Tóm tắt các trường

### Trường bắt buộc khi tạo mới

- `question` - Câu hỏi
- `answer` - Câu trả lời

### Trường tùy chọn

- `status` - Trạng thái (mặc định: active)
- `sort_order` - Thứ tự sắp xếp (mặc định: 0)

### Trường tự động sinh (KHÔNG cần gửi từ giao diện)

- `id` - ID tự động tăng
- `view_count` - Mặc định 0, tự động tăng khi có lượt xem
- `helpful_count` - Mặc định 0, tự động tăng khi người dùng đánh dấu hữu ích
- `created_at` - Thời gian tạo tự động
- `updated_at` - Thời gian cập nhật tự động
- `deleted_at` - Null mặc định (soft delete)

---

## Lưu ý khi tích hợp

1. **Question & Answer**: Cả câu hỏi và câu trả lời đều có thể chứa HTML hoặc text thuần, tùy thuộc vào cách hiển thị trên frontend.

2. **View Count**: Số lượt xem tự động tăng khi người dùng xem chi tiết FAQ (thường được xử lý ở public API).

3. **Helpful Count**: Số lượt đánh dấu hữu ích tự động tăng khi người dùng nhấn nút "Hữu ích" (thường được xử lý ở public API).

4. **Status**: Chỉ có 2 giá trị: `active` (hoạt động) và `inactive` (không hoạt động).

5. **Soft delete**: Khi xóa, FAQ sẽ được đánh dấu `deleted_at` thay vì xóa thực sự khỏi database.

6. **Phân trang**: Mặc định sắp xếp theo `sort_order` tăng dần, sau đó theo `created_at` giảm dần.

7. **Search**: Tìm kiếm sẽ tìm trong cả `question` và `answer`.

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy FAQ |
| 422 | Unprocessable Entity - Validation error |

