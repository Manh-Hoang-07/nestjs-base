# Tài liệu tích hợp API Comic Review & Analytics

Tài liệu này cung cấp chi tiết về các endpoint API cho tính năng **Đánh giá (Review)** và **Thống kê (Analytics)** của truyện.

## 1. Comic Review API (Đánh giá truyện)

Hệ thống review được chia làm 3 phân vùng: Public (dành cho khách), User (dành cho người dùng đã đăng nhập) và Admin (quản trị).

### A. Public API
Dùng để hiển thị danh sách đánh giá của một bộ truyện cho mọi đối tượng.

#### Lấy danh sách đánh giá của truyện
- **URL:** `GET /public/comic-reviews/comics/:comicId`
- **Method:** `GET`
- **Query Params:**
  - `page` (optional, default: 1): Trang hiện tại.
  - `limit` (optional, default: 20): Số lượng item trên một trang.
- **Response:**
```json
{
  "data": [
    {
      "id": "1",
      "comic_id": "100",
      "user_id": "50",
      "rating": 5,
      "content": "Truyện rất hay, cốt truyện hấp dẫn!",
      "created_at": "2024-02-02T10:00:00.000Z",
      "updated_at": "2024-02-02T10:00:00.000Z",
      "user": {
        "id": "50",
        "full_name": "Nguyễn Văn A",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "total_pages": 6
  }
}
```

---

### B. User API (Yêu cầu Token)
Dành cho người dùng thực hiện đánh giá hoặc quản lý đánh giá cá nhân.

#### Lấy danh sách đánh giá của tôi
- **URL:** `GET /user/comic-reviews`
- **Method:** `GET`
- **Response:** Danh sách các review mà user hiện tại đã thực hiện.

#### Gửi hoặc Cập nhật đánh giá
- **URL:** `POST /user/comic-reviews/comics/:comicId`
- **Method:** `POST`
- **Body:**
```json
{
  "rating": 5, // Bắt buộc, từ 1 đến 5
  "content": "Nội dung nhận xét (tùy chọn)"
}
```
- **Lưu ý:** Nếu user đã review truyện này rồi, API sẽ tự động cập nhật review cũ.

#### Xóa đánh giá của tôi
- **URL:** `DELETE /user/comic-reviews/comics/:comicId`
- **Method:** `DELETE`
- **Response:**
```json
{
  "success": true
}
```

#### Gửi bình luận
- **URL:** `POST /user/comic-comments`
- **Method:** `POST`
- **Body:**
```json
{
  "comic_id": "100", // Bắt buộc
  "content": "Nội dung bình luận", // Bắt buộc
  "parent_id": "123" // Tùy chọn, nếu là bình luận trả lời
}
```
- **Lưu ý:** Hỗ trợ reply qua `parent_id`.

---

### C. Admin API (Yêu cầu quyền Quản trị)
Dành cho trang Admin quản lý toàn bộ đánh giá trên hệ thống.

#### Danh sách đánh giá (Có filter)
- **URL:** `GET /admin/comic-reviews`
- **Method:** `GET`
- **Query Params:**
  - `comic_id`: Lọc theo truyện.
  - `user_id`: Lọc theo người dùng.
  - `rating`: Lọc theo số sao.
  - `rating_min`, `rating_max`: Lọc theo khoảng sao.
  - `search`: Tìm kiếm nội dung review.
  - `date_from`, `date_to`: Lọc theo khoảng ngày tạo.
  - `page`, `limit`, `sort` (VD: `created_at:DESC`).
- **Response:** Tương tự Public API nhưng bổ sung thông tin truyện (`comic`).

#### Thống kê đánh giá
- **URL:** `GET /admin/comic-reviews/statistics`
- **Method:** `GET`
- **Response:**
```json
{
  "total": 5000,
  "today": 15,
  "this_week": 120,
  "this_month": 450,
  "average_rating": 4.5,
  "rating_distribution": [
    { "rating": 1, "count": 10 },
    { "rating": 5, "count": 4500 }
  ]
}
```

#### Cập nhật/Xóa Review (Admin)
- `PUT /admin/comic-reviews/:id`: Sửa nội dung hoặc rating của một review.
- `DELETE /admin/comic-reviews/:id`: Xóa một review vi phạm.

---

## 2. Comic Analytics API (Thống kê - Admin)

Vui lòng xem chi tiết tại: [Tài liệu API Thống kê Comic Admin](./comic-admin-stats.md)


---
**Ghi chú:** Đơn vị Frontend cần gửi Header `Authorization: Bearer <token>` đối với các API thuộc phân vùng **User** và **Admin**.
