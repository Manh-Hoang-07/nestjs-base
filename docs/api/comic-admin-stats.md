# Tài liệu API Thống kê Comic Admin

Tài liệu này mô tả các API thống kê dành cho trang quản trị (Admin) của hệ thống Comic.
Các API này hỗ trợ lọc dữ liệu theo `groupId` để phục vụ mô hình đa cửa hàng/nhóm (Multi-group).

## 1. Thông tin chung

- **Base URL:** `/admin/stats`
- **Headers:**
  - `Authorization: Bearer <token>` (Bắt buộc)
  - `x-group-id: <id>` (Tùy chọn - Dùng để lọc dữ liệu theo nhóm/shop cụ thể. Nếu không gửi, hệ thống sẽ lấy theo nhóm mặc định của User).

---

## 2. Danh sách API

### 2.1. Thống kê tổng quan (Dashboard)
Lấy các thông số tổng hợp cho Dashboard.

- **URL:** `/admin/stats/dashboard`
- **Method:** `GET`
- **Headers:** `x-group-id` (optional)
- **Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "total_comics": 150,
    "total_views": 125000,
    "total_follows": 5200,
    "top_comics": [
      {
        "comic": {
          "id": 1,
          "title": "Bách Luyện Thành Thần",
          "slug": "bach-luyen-thanh-than",
          "cover_image": "https://example.com/images/bach-luyen.jpg",
          "author": "Ân Tứ Giải Thoát",
          "status": "published"
        },
        "stats": {
          "comic_id": 1,
          "view_count": 50000,
          "follow_count": 1200,
          "rating_count": 450,
          "rating_sum": 2150,
          "updated_at": "2024-02-03T10:00:00Z"
        }
      }
    ]
  },
  "meta": {},
  "timestamp": "2024-02-03T11:30:00+07:00"
}
```

### 2.2. Xếp hạng truyện (Top Comics)
Lấy danh sách các truyện có chỉ số cao nhất.

- **URL:** `/admin/stats/comics`
- **Method:** `GET`
- **Query Params:**
  - `limit` (number, default: 20): Số lượng bản ghi trả về.
  - `sortBy` (string, default: `views`): Tiêu chí sắp xếp. Hỗ trợ: `views`, `follows`, `rating`.
- **Headers:** `x-group-id` (optional)
- **Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "comic": {
        "id": 1,
        "title": "Bách Luyện Thành Thần",
        "slug": "bach-luyen-thanh-than",
        "cover_image": "https://example.com/images/bach-luyen.jpg",
        "author": "Ân Tứ Giải Thoát",
        "status": "published"
      },
      "stats": {
        "comic_id": 1,
        "view_count": 50000,
        "follow_count": 1200,
        "rating_count": 450,
        "rating_sum": 2150
      }
    }
  ],
  "meta": {},
  "timestamp": "2024-02-03T11:30:00+07:00"
}
```

### 2.3. Biểu đồ lượt xem theo thời gian
Lấy số liệu lượt xem được gom nhóm theo ngày trong một khoảng thời gian.

- **URL:** `/admin/stats/views`
- **Method:** `GET`
- **Query Params:**
  - `startDate` (string, bắt buộc): Ngày bắt đầu (Định dạng YYYY-MM-DD).
  - `endDate` (string, bắt buộc): Ngày kết thúc (Định dạng YYYY-MM-DD).
- **Headers:** `x-group-id` (optional)
- **Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "date": "2024-02-01",
      "count": 1500
    },
    {
      "date": "2024-02-02",
      "count": 1850
    },
    {
      "date": "2024-02-03",
      "count": 2100
    }
  ],
  "meta": {},
  "timestamp": "2024-02-03T11:30:00+07:00"
}
```

---

## 3. Lưu ý cho Frontend

1. **Xử lý groupId:**
   - Luôn gửi `x-group-id` trong Header nếu Dashboard đang ở chế độ xem một Shop/Nhóm cụ thể.
   - Nếu không có `x-group-id`, API sẽ tự động lấy dữ liệu theo Nhóm có quyền cao nhất của User hiện tại.

2. **Định dạng thời gian:**
   - Các API yêu cầu `startDate`, `endDate` nhận định dạng chuỗi `YYYY-MM-DD`.

3. **Thông tin truyện:**
   - Thông tin `comic` đi kèm trong danh sách `top_comics` giúp FE hiển thị tên và ảnh bìa truyện mà không cần gọi thêm API lấy chi tiết truyện.
