# Tài liệu Tích hợp API: Bình luận Truyện (Comic Comments)

Tài liệu này hướng dẫn cách tích hợp các tính năng bình luận của module truyện tranh, bao gồm hiển thị bình luận theo bộ truyện/chương, gửi bình luận mới, trả lời bình luận (threaded comments) và quản lý cá nhân.

## 1. Thông tin chung
- **Base URL**: `http://localhost:3000/api`
- **Headers**: `Content-Type: application/json`
- **Xác thực**: Các API trong phân vùng `/user` và `/admin` yêu cầu Header `Authorization: Bearer <token>`.

---

## 2. Cấu trúc Đối tượng Bình luận (ComicComment Object)

| Thuộc tính | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | string | ID của bình luận (BigInt - FE nhận dạng string) |
| `comic_id` | string | ID của bộ truyện |
| `chapter_id` | string \| null | ID của chương (null nếu bình luận ở trang chi tiết truyện) |
| `parent_id` | string \| null | ID của bình luận cha (dùng cho tính năng reply) |
| `content` | string | Nội dung bình luận (đã qua xử lý sanitize) |
| `status` | string | Trạng thái: `visible` (hiển thị), `hidden` (bị ẩn) |
| `created_at` | datetime | Ngày tạo |
| `user` | object | Thông tin người đăng: `{ id, username, name, image }` |
| `replies` | array | Danh sách các câu trả lời (ComicComment objects) |

---

## 3. Public API (Dành cho mọi đối tượng)

### A. Lấy bình luận theo bộ truyện
Hiển thị ở trang chi tiết truyện (`/comics/:slug`). Trả về các bình luận "top-level" (không có cha) và các câu trả lời đi kèm.

- **URL**: `GET /public/comic-comments/comics/:comicId`
- **Query Params**:
  - `page`: (mặc định 1)
  - `limit`: (mặc định 20)
- **Response**: Trả về cấu trúc cây (tree) với tối đa 1 cấp reply lồng trong `replies`.

### B. Lấy bình luận theo chương truyện
Hiển thị ở trang đọc truyện (`/chapters/:id`). 

- **URL**: `GET /public/comic-comments/chapters/:chapterId`
- **Query Params**:
  - `page`, `limit`
- **Response**: Tương tự như lấy theo bộ truyện.

---

## 4. User API (Yêu cầu Đăng nhập)

### A. Gửi bình luận mới hoặc Trả lời
Dùng chung một API để đăng bình luận mới hoặc reply một người khác.

- **URL**: `POST /user/comic-comments`
- **Rate Limit**: Tối đa 20 bình luận/phút.
- **Body**:
```json
{
  "comic_id": 100,      // ID của truyện (Bắt buộc)
  "chapter_id": 500,    // ID của chương (Tùy chọn)
  "parent_id": 123,     // ID của bình luận muốn trả lời (Tùy chọn)
  "content": "Nội dung bình luận..." // Bắt buộc
}
```

### B. Cập nhật bình luận của mình
Người dùng chỉ được sửa nội dung bình luận của chính mình.

- **URL**: `PUT /user/comic-comments/:id`
- **Body**: `{ "content": "Nội dung mới..." }`

### C. Xóa bình luận của mình
- **URL**: `DELETE /user/comic-comments/:id`

### D. Danh sách bình luận "Của tôi"
Dùng để hiển thị trong trang cá nhân/lịch sử hoạt động.

- **URL**: `GET /user/comic-comments`
- **Query Params**: `page`, `limit`.

---

## 5. Admin API (Quản trị viên)
Dùng cho giao diện Dashboard/CMS.

- **Danh sách toàn bộ**: `GET /admin/comic-comments` (Hỗ trợ lọc theo `status`, `user_id`, `comic_id`, `search`).
- **Thống kê**: `GET /admin/comic-comments/statistics` (Trả về tổng số, số lượng mới hôm nay/trong tuần/tháng).
- **Ẩn/Hiện bình luận**: `PUT /admin/comic-comments/:id` (Body: `{ "status": "hidden" }`).
- **Xóa vĩnh viễn**: `DELETE /admin/comic-comments/:id`.

---

## 6. Lưu ý cho Frontend (Integration Tips)
1. **Threaded Design**: Giao diện nên thụt lề (indent) đối với các đối tượng trong mảng `replies`.
2. **HTML Sanitize**: Backend đã sanitize nội dung, nhưng FE nên sử dụng các thư viện như `DOMPurify` nếu render trực tiếp HTML (nếu có hỗ trợ format).
3. **Optimistic UI**: Sau khi gọi POST thành công, FE nên tự append bình luận mới vào đầu danh sách để tăng trải nghiệm người dùng.
4. **BigInt Handling**: Luôn xử lý các trường ID (`id`, `user_id`, `comic_id`) dưới dạng **String** để tránh sai số kỹ thuật.

---
*Cập nhật lần cuối: 02/02/2026*
