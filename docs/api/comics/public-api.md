# Comic Public API Documentation

Tài liệu hướng dẫn tích hợp các API truyện tranh dành cho Frontend (Phần Public).

## 1. Thông tin chung
- **Base URL**: `http://localhost:3000/api`
- **Quyền truy cập**: Public (Không yêu cầu đăng nhập)
- **Format phản hồi**: Tất cả dữ liệu được wrap trong object `success`, `message`, `data`.

---

## 2. Truyện tranh (Comics)

### 2.1. Danh sách truyện tranh
Lấy danh sách có phân trang, lọc và sắp xếp.

- **Endpoint**: `GET /public/comics`
- **Query Parameters**:
  - `page`: Trang hiện tại (mặc định: 1)
  - `limit`: Số lượng trên mỗi trang (mặc định: 10)
  - `sort`: Sắp xếp theo format `field:dir` (ví dụ: `created_at:DESC`, `view_count:DESC`)
  - `search`: Tìm kiếm theo tên truyện, tác giả.
  - `comic_category_id`: Lọc theo ID danh mục.
- **Ví dụ**: `GET /public/comics?page=1&limit=20&sort=view_count:DESC`

### 2.2. Chi tiết truyện tranh
Lấy thông tin chi tiết của một bộ truyện dựa trên slug.

- **Endpoint**: `GET /public/comics/:slug`
- **Ví dụ**: `GET /public/comics/dao-hai-tac`
- **Dữ liệu trả về**: Thông tin truyện, danh mục, chapter mới nhất và thống kê (views, follows).

### 2.3. Lấy danh sách Chapter theo bộ truyện
Lấy nhanh danh sách chapter của một bộ truyện.

- **Endpoint**: `GET /public/comics/:slug/chapters`
- **Query Parameters**: `page`, `limit` (Phân trang chapter).

---

## 3. Chapter (Chương)

### 3.1. Chi tiết Chapter
Lấy thông tin cơ bản của một chapter (không bao gồm nội dung hình ảnh).

- **Endpoint**: `GET /public/chapters/:id`
- **Ví dụ**: `GET /public/chapters/10`

### 3.2. Nội dung Chapter (Hình ảnh/Trang truyện)
Lấy danh sách các URL hình ảnh của chapter này.

- **Endpoint**: `GET /public/chapters/:id/pages`
- **Dữ liệu trả về**: Mảng các đối tượng chứa `image_url`, `page_number`.

### 3.3. Chapter tiếp theo / Chapter trước đó
Dùng để điều hướng người dùng khi đang đọc.

- **Endpoint**: 
  - Tiếp theo: `GET /public/chapters/:id/next`
  - Trước đó: `GET /public/chapters/:id/prev`

### 3.4. Theo dõi lượt xem (Track View)
Gửi request khi người dùng mở chapter để tăng view cho truyện.

- **Endpoint**: `POST /public/chapters/:id/view`

---

## 4. Danh mục truyện (Comic Categories)

### 4.1. Danh sách danh mục
Lấy toàn bộ danh mục truyện để hiển thị ở menu hoặc bộ lọc.

- **Endpoint**: `GET /public/comic-categories`
- **Query Parameters**: `search` (tìm kiếm danh mục).

### 4.2. Chi tiết danh mục
- **Endpoint**: `GET /public/comic-categories/:slug`

---

## 5. Lưu ý cho Frontend

### 5.1. Sắp xếp (Sorting)
Hệ thống hỗ trợ sắp xếp theo các trường:
- `created_at`: Truyện mới đăng.
- `last_chapter_updated_at`: Truyện mới cập nhật chương.
- `view_count`: Truyện xem nhiều nhất.
- `follow_count`: Truyện yêu thích nhất.

### 5.2. ID vs Slug
- Dùng **Slug** (`/one-piece`) cho các trang hiển thị như Chi tiết truyện.
- Dùng **ID** (`/123`) cho các API Chapter và các hành động (Like, Follow, View).

### 5.3. Xử lý BigInt
Các trường ID trong hệ thống là BigInt, khi trả về API sẽ được convert sang kiểu `string`. Hãy lưu ý điều này khi so sánh hoặc tính toán ở JS.

### 5.4. Hình ảnh
Tất cả `cover_image` và `image_url` có thể là đường dẫn tương đối (từ `/uploads/...`). Bạn nên kết nối với `BASE_FILE_URL` từ cấu trúc hệ thống để hiển thị đầy đủ.

---
*Tài liệu được cập nhật ngày: 01/02/2026*
