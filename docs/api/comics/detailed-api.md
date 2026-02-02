# Comic API Integration Guide (Detailed)

Tài liệu chi tiết về Request và Response dành cho mọi tính năng của module truyện tranh.

## 1. Thông tin chung
- **Base URL**: `http://localhost:3000/api`
- **Headers**: `Content-Type: application/json`
- **Cấu trúc Response tiêu chuẩn**:
  ```json
  {
    "success": true,
    "message": "Thông báo thành công",
    "code": "SUCCESS",
    "httpStatus": 200,
    "data": {}, // Hoặc mảng [ ... ]
    "meta": {}, // Chứa thông tin phân trang (pagination) nếu có
    "timestamp": "2026-02-02T00:00:00+07:00"
  }
  ```

---

## 2. Dữ liệu Trang chủ (Home Page)
API này được tối ưu để lấy toàn bộ các khối dữ liệu trang chủ trong một lần request.

- **Endpoint**: `GET /public/homepage`
- **Response Structure**:
```json
{
  "data": {
    "top_viewed_comics": [],       // Top 10 truyện xem nhiều
    "trending_comics": [],          // Top 30 truyện xu hướng
    "popular_comics": [],           // Top 30 truyện phổ biến (theo follow)
    "newest_comics": [],            // Top 30 truyện mới đăng
    "recent_update_comics": [],     // Top 10 truyện mới cập nhật chương
    "comic_categories": []          // Danh sách danh mục truyện
  }
}
```

---

## 3. Quản lý Truyện (Comics)

### 3.1. Danh sách truyện (Phân trang & Lọc)
- **Endpoint**: `GET /public/comics`
- **Query Params**:
    - `page` (1, 2, ...): Trang hiện tại
    - `limit` (10, 20, ...): Số lượng truyện mỗi trang
    - `sort` (string): `view_count:DESC`, `follow_count:DESC`, `created_at:DESC`, `last_chapter_updated_at:DESC`
    - `comic_category_id` (string): Lọc theo danh mục truyện
    - `search` (string): Tìm kiếm theo tên truyện, tác giả
- **Response Meta (Pagination)**:
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 500,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 3.2. Chi tiết truyện tranh (Slug)
- **Endpoint**: `GET /public/comics/:slug`
- **Dữ liệu trả về**: 
  - Đầy đủ thông tin truyện, tác giả, trạng thái.
  - Thống kê (`stats`): lượt xem, lượt theo dõi.
  - Thông tin chương mới nhất (`last_chapter`).
  - Trạng thái user hiện tại (`is_following`) nếu đã login.

---

## 4. Chapters (Chương & Đọc truyện)

### 4.1. Danh sách Chapter của truyện
- **Endpoint**: `GET /public/comics/:slug/chapters`
- **Response**: Trả về danh sách chapter có phân trang, sắp xếp từ chương mới nhất đến chương cũ nhất.

### 4.2. Nội dung trang truyện
- **Endpoint**: `GET /public/chapters/:id/pages`
- **Response Data**:
```json
{
  "data": [
    { "page_number": 1, "image_url": "..." },
    { "page_number": 2, "image_url": "..." }
  ]
}
```

### 4.3. Điều hướng & Theo dõi lượt xem
- **Kế tiếp**: `GET /public/chapters/:id/next`
- **Trở về**: `GET /public/chapters/:id/prev`
- **Tăng view**: `POST /public/chapters/:id/view` (Nên gọi khi người dùng mở trang đọc)

---

## 5. Danh mục (Categories)
- **Danh sách**: `GET /public/comic-categories`
- **Chi tiết**: `GET /public/comic-categories/:slug`

---

## 6. Tính năng người dùng (Yêu cầu Token)

### 6.1. Theo dõi (Follow)
- **Danh sách đã theo dõi**: `GET /user/follows`
- **Follow**: `POST /user/follows/comics/:comicId`
- **Unfollow**: `DELETE /user/follows/comics/:comicId`

### 6.2. Lịch sử đọc (History)
- **Lưu lịch sử**: `POST /user/reading-history`
  - Body: `{ "comic_id": 1, "chapter_id": 100 }`
- **Xóa lịch sử của truyện**: `DELETE /user/reading-history/:comicId`

### 6.3. Đánh giá & Bình luận
- **Review truyện**: `POST /user/comic-reviews/comics/:comicId` (Body: `{ "rating": 5, "content": "..." }`)
- **Gửi bình luận**: `POST /user/comic-comments` (Hỗ trợ reply qua `parent_id`)

---

## 7. Schema đối tượng chính (ComicObject)
| Thuộc tính | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | string | ID BigInt (FE nhận dạng string) |
| `title` | string | Tên bộ truyện |
| `slug` | string | Slug dùng cho URL |
| `cover_image` | string | Link ảnh (Có thể là path tương đối) |
| `stats` | object | `{ view_count, follow_count, rating_count }` |
| `categories` | array | Danh sách `{ id, name, slug }` |
| `last_chapter`| object | `{ id, chapter_index, chapter_label, created_at }` |

---
*Tài liệu được cập nhật ngày: 02/02/2026*
