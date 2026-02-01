# Comic Homepage API

Tài liệu API tích hợp truyện tranh ở trang chủ. API này cung cấp toàn bộ dữ liệu cần thiết cho trang chủ (Home Page) trong một lần gọi duy nhất để tối ưu hiệu suất.

## 1. Thông tin chung
- **Base URL**: `http://localhost:3000/api`
- **Endpoint**: `GET /public/homepage`
- **Quyền truy cập**: Public (Không yêu cầu đăng nhập)
- **Headers**: `Content-Type: application/json`

---

## 2. Dữ liệu Trang chủ (Aggregate API)

Lấy tất cả các khối dữ liệu (blocks) cho trang chủ bao gồm truyện xem nhiều, truyện hot, truyện mới, truyện mới cập nhật và danh mục.

### Request
```bash
curl -X GET "http://localhost:3000/api/public/homepage"
```

### Response Format
Dữ liệu được wrap bởi `TransformInterceptor` tiêu chuẩn:

```json
{
  "success": true,
  "message": "Lấy dữ liệu trang chủ thành công.",
  "data": {
    "top_viewed_comics": [...],
    "trending_comics": [...],
    "popular_comics": [...],
    "newest_comics": [...],
    "recent_update_comics": [...],
    "comic_categories": [...]
  }
}
```

### Chi tiết các khối dữ liệu (Data Blocks)

| Trường | Số lượng | Sắp xếp | Cache TTL |
| :--- | :--- | :--- | :--- |
| `top_viewed_comics` | 10 | Lượt xem giảm dần | 7 phút |
| `trending_comics` | 30 | Lượt xem giảm dần (Trending) | 7 phút |
| `popular_comics` | 30 | Lượt theo dõi giảm dần | 20 phút |
| `newest_comics` | 30 | Ngày tạo mới nhất | 2 phút |
| `recent_update_comics` | 10 | Ngày cập nhật chapter mới nhất | 2 phút |
| `comic_categories` | 20 | Mặc định | 12 giờ |

---

## 3. Cấu trúc đối tượng (Object Schemas)

### Đối tượng Truyện tranh (Comic Object)
Mỗi truyện trong các danh sách trên sẽ có cấu trúc như sau:

| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | `string` | ID của truyện (BigInt convert sang string) |
| `title` | `string` | Tiêu đề truyện |
| `slug` | `string` | URL slug |
| `description` | `string` | Mô tả truyện |
| `cover_image` | `string` | Link ảnh bìa |
| `author` | `string` | Tên tác giả |
| `status` | `string` | Trạng thái (`draft`, `published`, `completed`, `hidden`) |
| `last_chapter_updated_at` | `string` | Thời gian chapter cuối được cập nhật (ISO 8601) |
| `categories` | `Array<Category>` | Danh sách danh mục của truyện |
| `last_chapter` | `Object` | Thông tin chapter mới nhất (id, title, index, label) |
| `stats` | `Object` | Thống kê: `view_count`, `follow_count`, `rating_count`, `rating_sum` |

**Ví dụ đối tượng truyện:**
```json
{
  "id": "123456789",
  "title": "Đảo Hải Tặc (One Piece)",
  "slug": "one-piece",
  "description": "Câu chuyện về Monkey D. Luffy...",
  "cover_image": "/uploads/comics/one-piece-cover.jpg",
  "author": "Eiichiro Oda",
  "status": "published",
  "last_chapter_updated_at": "2024-02-01T10:00:00.000Z",
  "categories": [
    { "id": "1", "name": "Action", "slug": "action" },
    { "id": "2", "name": "Adventure", "slug": "adventure" }
  ],
  "last_chapter": {
    "id": "999",
    "title": "Hành trình mới",
    "chapter_index": 1100,
    "chapter_label": "Chapter 1100",
    "created_at": "2024-02-01T09:00:00.000Z"
  },
  "stats": {
    "view_count": "1500000",
    "follow_count": "50000",
    "rating_count": "1200",
    "rating_sum": "5800"
  }
}
```

### Đối tượng Danh mục (Category Object)
```json
{
  "id": "1",
  "name": "Hành động",
  "slug": "hanh-dong",
  "description": "Truyện có nhiều cảnh chiến đấu hấp dẫn"
}
```

---

## 4. Các API bổ trợ cho Trang chủ

Thường được dùng cùng với API trang chủ để hoàn thiện trải nghiệm người dùng.

### 4.1. Lấy Banners (Public Banners)
Dùng để hiển thị Slider/Carousel ở đầu trang.

- **Endpoint**: `GET /public/banners`
- **Query Params**: `locationCode` (ví dụ: `HOME_TOP`)

### 4.2. Lấy danh sách đối tác (Partners)
Dùng nếu trang chủ có phần hiển thị đối tác/nhà tài trợ.

- **Endpoint**: `GET /public/partners`

---

## 5. Chiến lược Cache & Hiệu suất

- **Server-side Caching**: Toàn bộ dữ liệu trang chủ được cache bằng Redis/In-memory.
- **Auto-refetch**: Khi có một chapter mới được đăng, cache `recent_update_comics` sẽ được xóa để cập nhật dữ liệu mới nhất.
- **Parallel Fetching**: Hệ thống lấy dữ liệu từ 6 nguồn khác nhau song song, giúp tốc độ phản hồi cực nhanh (~50-100ms).

---

## 6. Gợi ý tích hợp Frontend

1. **Skeleton Loading**: Nên hiển thị skeleton cho từng block (Top Viewed, Trending, v.v.) trong khi chờ dữ liệu.
2. **Infinite Scroll**: Đối với các phần truyện mới hoặc chapter mới, có thể dùng API `/public/comics` với pagination nếu người dùng muốn xem thêm.
3. **Optimistic Follow**: Nếu người dùng nhấn Follow truyện từ trang chủ, hãy cập nhật UI ngay lập tức trước khi nhận phản hồi từ API `/user/follows`.

---

## 7. Mã lỗi thường gặp (Common Error Codes)

- `200 OK`: Thành công.
- `500 Internal Server Error`: Lỗi hệ thống hoặc database.
- `429 Too Many Requests`: Nếu gọi API quá nhiều lần trong thời gian ngắn (Rate limiting).

---
*Tài liệu được cập nhật ngày: 01/02/2024*
