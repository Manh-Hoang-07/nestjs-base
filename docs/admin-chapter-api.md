# Tài liệu API Quản lý Chương (Admin Chapter API)

Tài liệu này mô tả chi tiết các API dành cho phía Frontend (FE) để tích hợp giao diện quản lý chương (Chapter) trong hệ thống quản trị.

**Base URL**: `/api/admin/chapters`
**Xác thực**: Bearer Token
**Quyền hạn**: `comic.manage`

---

## 1. Danh sách chương (List Chapters)

Sử dụng để hiển thị bảng danh sách các chương của một truyện hoặc tất cả các chương.

- **Endpoint**: `GET /api/admin/chapters`
- **Query Parameters**:
    - `comic_id`: (Optional) ID của truyện để lọc danh sách chương của truyện đó.
    - `status`: (Optional) Trạng thái chương (`draft`, `published`).
    - `search`: (Optional) Tìm kiếm theo tiêu đề chương.
    - `page`: (Optional) Trang hiện tại (mặc định: 1).
    - `limit`: (Optional) Số lượng bản ghi trên mỗi trang (mặc định: 10).
    - `sort`: (Optional) Sắp xếp theo định dạng `field:dir` (mặc định: `chapter_index:desc`).

- **Cấu trúc dữ liệu trả về (Success Response)**:

```json
{
    "data": [
        {
            "id": 275,
            "comic_id": 12,
            "team_id": null,
            "title": "Chapter 16",
            "chapter_index": 16,
            "chapter_label": "Chương 16",
            "status": "published",
            "view_count": 3371,
            "created_user_id": 1,
            "updated_user_id": 1,
            "created_at": "2026-02-02T07:57:18.000Z",
            "updated_at": "2026-02-02T07:57:18.000Z",
            "comic": {
                "id": 12,
                "title": "Dragon Ball",
                "slug": "dragon-ball",
                "cover_image": "https://..."
            },
            "_count": {
                "pages": 45
            }
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "total_pages": 10
    }
}
```

---

## 2. Chi tiết chương (Get Chapter Details)

Lấy đầy đủ thông tin của một chương, bao gồm danh sách các trang (pages) để chỉnh sửa.

- **Endpoint**: `GET /api/admin/chapters/:id`
- **Response**:

```json
{
    "id": 275,
    "comic_id": 12,
    "team_id": null,
    "title": "Chapter 16",
    "chapter_index": 16,
    "chapter_label": "Chương 16",
    "status": "published",
    "view_count": 3371,
    "created_user_id": 1,
    "updated_user_id": 1,
    "created_at": "2026-02-02T07:57:18.000Z",
    "updated_at": "2026-02-02T07:57:18.000Z",
    "pages": [
        {
            "id": 5457,
            "chapter_id": 275,
            "page_number": 1,
            "image_url": "https://...",
            "width": 800,
            "height": 1200,
            "file_size": 2274,
            "created_at": "2026-02-02T09:11:53.000Z"
        }
    ],
    "comic": {
        "id": 12,
        "title": "Dragon Ball",
        "slug": "dragon-ball",
        "cover_image": "https://..."
    }
}
```

---

## 3. Tạo chương mới (Create Chapter)

- **Endpoint**: `POST /api/admin/chapters`
- **Body**:

```json
{
    "comic_id": 12,
    "title": "Chapter 17",
    "chapter_index": 17,
    "chapter_label": "Chương 17",
    "status": "draft",
    "team_id": null,
    "pages": [  // Optional, có thể tạo chương trống rồi upload sau
        {
            "image_url": "https://...",
            "width": 800,
            "height": 1200,
            "file_size": 1024
        }
    ]
}
```

---

## 4. Cập nhật thông tin chương (Update Chapter)

- **Endpoint**: `PUT /api/admin/chapters/:id`
- **Body**: (Gửi các trường cần thay đổi)

```json
{
    "title": "Chapter 16 - Revised",
    "status": "published",
    "chapter_index": 16,
    "chapter_label": "Chương 16 (Bản sửa)"
}
```

---

## 5. Upload/Cập nhật các trang truyện (Update Pages)

Có 2 cách để cập nhật các trang truyện:

### Cách 1: Upload trực tiếp file (Multipart/form-data)
Sử dụng khi admin chọn file từ máy tính để tải lên. Hệ thống sẽ xóa các trang cũ và thay thế bằng các trang mới.

- **Endpoint**: `POST /api/admin/chapters/:id/pages`
- **Content-Type**: `multipart/form-data`
- **Body**:
    - `files`: Chọn nhiều file (tối đa 100 file mỗi lần).

### Cách 2: Cập nhật bằng danh sách URLs (JSON)
Sử dụng khi muốn sắp xếp lại thứ tự các trang hoặc thay đổi URL ảnh.

- **Endpoint**: `PUT /api/admin/chapters/:id/pages`
- **Body**:
```json
{
    "pages": [
        {
            "image_url": "https://...",
            "width": 800,
            "height": 1200,
            "file_size": 1024
        },
        ...
    ]
}
```

---

## 6. Xóa chương (Delete Chapter)

- **Endpoint**: `DELETE /api/admin/chapters/:id`
- **Response**: `{ "success": true }` hoặc thông báo thành công.

---

## Ghi chú cho Frontend

1. **Hiển thị danh sách**: Bản danh sách chương hiện tại trả về thêm thông tin `comic` (title, slug, cover_image) và `_count.pages` (số lượng trang). Điều này giúp FE hiển thị đầy đủ thông tin mà không cần gọi thêm API khác.
2. **comic_id**: Trường này luôn có trong dữ liệu trả về để FE biết chương đó thuộc truyện nào.
3. **BigInt**: Các trường ID đang dùng kiểu số lớn, hệ thống đã tự động convert sang `number` hoặc `string` trong kết quả trả về, FE xử lý như bình thường.
4. **Trạng thái**: Có 2 trạng thái chính là `draft` (Bản nháp) và `published` (Đã xuất bản). Chỉ các chương `published` mới hiển thị cho người dùng cuối.
