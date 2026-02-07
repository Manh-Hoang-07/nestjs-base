# Tài liệu Tích hợp API Người dùng (Truyện tranh)

Tài liệu này hướng dẫn tích hợp các tính năng: Bookmark, Lịch sử đọc, Theo dõi truyện và Bình luận.

---

## 1. Xác thực (Authentication)
- Hầu hết các API dành cho người dùng yêu cầu header bài viết:
  - `Authorization: Bearer <access_token>`

---

## 2. Bookmark (Dấu trang)

Dùng để lưu lại vị trí trang đang đọc trong một chương truyện.

### 2.1 Lấy danh sách bookmark
- **Endpoint:** `GET /user/bookmarks`
- **Auth:** Required
- **Phản hồi mẫu:**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "chapter_id": 456,
    "page_number": 5,
    "created_at": "2024-02-07T13:00:00Z",
    "chapter": {
      "id": 456,
      "title": "Chương 10",
      "comic": {
        "id": 789,
        "title": "Tên truyện"
      }
    }
  }
]
```

### 2.2 Tạo mới hoặc cập nhật bookmark
- **Endpoint:** `POST /user/bookmarks`
- **Auth:** Required
- **Body:**
```json
{
  "chapter_id": 456,
  "page_number": 10
}
```

### 2.3 Xóa bookmark
- **Endpoint:** `DELETE /user/bookmarks/:id`
- **Auth:** Required

---

## 3. Lịch sử đọc (Reading History)

Tự động lưu lại chương cuối cùng người dùng đã đọc của một bộ truyện.

### 3.1 Lấy danh sách lịch sử đọc
- **Endpoint:** `GET /user/reading-history`
- **Auth:** Required
- **Phản hồi mẫu:**
```json
[
  {
    "id": 1,
    "comic_id": 789,
    "chapter_id": 456,
    "updated_at": "2024-02-07T13:00:00Z",
    "comic": {
      "id": 789,
      "title": "Tên truyện",
      "thumbnail": "url_to_image"
    },
    "chapter": {
      "id": 456,
      "title": "Chương 10"
    }
  }
]
```

### 3.2 Cập nhật lịch sử đọc
- Nên gọi API này mỗi khi người dùng mở một chương mới.
- **Endpoint:** `POST /user/reading-history`
- **Auth:** Required
- **Body:**
```json
{
  "comic_id": 789,
  "chapter_id": 456
}
```

### 3.3 Xóa lịch sử đọc của một truyện
- **Endpoint:** `DELETE /user/reading-history/:comicId`
- **Auth:** Required

---

## 4. Theo dõi truyện (Follow)

### 4.1 Lấy danh sách truyện đang theo dõi
- **Endpoint:** `GET /user/follows`
- **Auth:** Required

### 4.2 Theo dõi truyện
- **Endpoint:** `POST /user/follows/comics/:comicId`
- **Auth:** Required

### 4.3 Bỏ theo dõi truyện
- **Endpoint:** `DELETE /user/follows/comics/:comicId`
- **Auth:** Required

### 4.4 Kiểm tra trạng thái theo dõi
- Dùng để hiển thị nút "Theo dõi" hoặc "Đang theo dõi" trên giao diện.
- **Endpoint:** `GET /user/follows/comics/:comicId/is-following`
- **Auth:** Required
- **Phản hồi:**
```json
{
  "is_following": true
}
```

---

## 5. Bình luận (Comment)

### 5.1 Lấy danh sách bình luận (Public)
Dùng để hiển thị ở trang chi tiết truyện hoặc chi tiết chương.

- **Theo truyện:** `GET /public/comic-comments/comics/:comicId?page=1&limit=20`
- **Theo chương:** `GET /public/comic-comments/chapters/:chapterId?page=1&limit=20`
- **Phản hồi:** Danh sách bình luận bao gồm thông tin người dùng và các bình luận con (nếu có).

### 5.2 Gửi bình luận mới (User)
- **Endpoint:** `POST /user/comic-comments`
- **Auth:** Required
- **Body:**
```json
{
  "comic_id": 789,
  "chapter_id": 456, // Có thể null nếu bình luận ở trang truyện
  "parent_id": null, // ID của bình luận cha nếu là feedback (trả lời)
  "content": "Nội dung bình luận"
}
```

### 5.3 Lấy danh sách bình luận của tôi
- **Endpoint:** `GET /user/comic-comments?page=1&limit=20`
- **Auth:** Required

### 5.4 Chỉnh sửa bình luận
- **Endpoint:** `PUT /user/comic-comments/:id`
- **Auth:** Required
- **Body:**
```json
{
  "content": "Nội dung mới"
}
```

### 5.5 Xóa bình luận
- **Endpoint:** `DELETE /user/comic-comments/:id`
- **Auth:** Required

---

## Lưu ý chung
- **Rate Limit:** API tạo bình luận có giới hạn 20 bình luận mỗi phút.
- **Sanitization:** Nội dung bình luận sẽ được hệ thống tự động làm sạch (sanitize HTML) để đảm bảo an toàn.
