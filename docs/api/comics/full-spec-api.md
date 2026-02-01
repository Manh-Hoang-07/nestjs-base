# Comic API Integration Guide (Full Specification)

Tài liệu chi tiết về Request và Response dành cho tích hợp giao diện truyện tranh.

## 1. Thông tin chung
- **Base URL**: `http://localhost:3000/api`
- **Headers**: `Content-Type: application/json`
- **Cấu trúc Response chuẩn**:
  ```json
  {
    "success": true,
    "message": "Thông báo thành công",
    "code": "SUCCESS",
    "httpStatus": 200,
    "data": {}, // Hoặc mảng []
    "meta": {}, // Chứa thông tin phân trang nếu có
    "timestamp": "2026-02-02T00:00:00+07:00"
  }
  ```

---

## 2. Trang chủ (Home Page)
API gộp toàn bộ dữ liệu cần thiết để render trang chủ.

- **Endpoint**: `GET /public/homepage`
- **Request**: Không
- **Response Data Structure**:
```json
{
  "data": {
    "top_viewed_comics": [ComicObject],       // Xem nhiều nhất (10 truyện)
    "trending_comics": [ComicObject],         // Xu hướng (30 truyện)
    "popular_comics": [ComicObject],          // Phổ biến theo follow (30 truyện)
    "newest_comics": [ComicObject],           // Truyện mới đăng (30 truyện)
    "recent_update_comics": [ComicObject],    // Mới cập nhật chapter (10 truyện)
    "comic_categories": [CategoryObject]      // Danh sách danh mục
  }
}
```

---

## 3. Danh sách & Chi tiết Truyện (Public Comics)

### 3.1. Lấy danh sách truyện (Có phân trang)
- **Endpoint**: `GET /public/comics`
- **Query Params**:
    - `page` (number): 1
    - `limit` (number): 20
    - `sort` (string): `view_count:DESC`, `follow_count:DESC`, `created_at:DESC`
    - `comic_category_id` (string): Lọc theo danh mục
    - `search` (string): Tìm theo tên truyện, tác giả
- **Response**:
```json
{
  "data": [ComicObject],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 3.2. Lấy chi tiết một bộ truyện
- **Endpoint**: `GET /public/comics/:slug`
- **Request**: `GET /public/comics/dao-hai-tac`
- **Response Data**:
```json
{
  "data": {
    "id": "1",
    "title": "Đảo Hải Tặc",
    "slug": "dao-hai-tac",
    "description": "Nội dung truyện...",
    "cover_image": "/uploads/comics/one-piece.jpg",
    "author": "Eiichiro Oda",
    "status": "published",
    "categories": [{ "id": "1", "name": "Hành động" }],
    "stats": {
      "view_count": "1500000",
      "follow_count": "50000"
    },
    "last_chapter": {
      "id": "100",
      "chapter_label": "Chương 1100",
      "created_at": "..."
    },
    "is_following": false // Trả về true nếu user đã đăng nhập và đang follow
  }
}
```

---

## 4. Chapters (Chương truyện)

### 4.1. Lấy danh sách chapter của truyện
- **Endpoint**: `GET /public/comics/:slug/chapters`
- **Query Params**: `page`, `limit` (mặc định 50 chương)
- **Response**: Trả về danh sách chapter kèm phân trang.

### 4.2. Lấy nội dung trang truyện (Đọc truyện)
- **Endpoint**: `GET /public/chapters/:id/pages`
- **Response Data**:
```json
{
  "data": [
    { "page_number": 1, "image_url": "http://domain.com/p1.jpg" },
    { "page_number": 2, "image_url": "http://domain.com/p2.jpg" }
  ]
}
```

---

## 5. Chức năng Người dùng (Yêu cầu Login)

### 5.1. Theo dõi truyện (Follow)
- **Follow**: `POST /user/follows/comics/:comicId`
- **Unfollow**: `DELETE /user/follows/comics/:comicId`

### 5.2. Lịch sử đọc (Reading History)
- **Lưu lịch sử**: `POST /user/reading-history`
- **Payload**:
```json
{
  "comic_id": 1,
  "chapter_id": 100
}
```

### 5.3. Bình luận (Comments)
- **Lấy bình luận truyện**: `GET /public/comments/comics/:comicId`
- **Gửi bình luận**: `POST /user/comments`
- **Payload**:
```json
{
  "comic_id": 1,
  "content": "Truyện hay quá!",
  "parent_id": null // Nếu là reply thì truyền ID comment cha
}
```

---

## 6. Sơ đồ Schema dữ liệu (ComicObject)
| Trường | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | string | ID định danh (BigInt) |
| `title` | string | Tên truyện |
| `slug` | string | Đường dẫn thân thiện |
| `cover_image`| string | Link ảnh bìa |
| `stats` | object | Thống kê: `view_count`, `follow_count`, `rating_count` |
| `last_chapter`| object | Thông tin chương mới nhất |

---
*Tài liệu được cập nhật ngày: 02/02/2026*
