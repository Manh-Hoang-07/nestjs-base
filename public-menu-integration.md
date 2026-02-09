# Tài liệu Tích hợp API Public Menu (Website)

Tài liệu này hướng dẫn FE cách tích hợp API để hiển thị Menu trên giao diện Website (Client) và các thông tin về dữ liệu menu đã được cập nhật.

---

## 1. API Menu Public

Dùng để lấy danh sách menu đã được cấu hình dành riêng cho giao diện Website (không bao gồm menu Admin).

- **Endpoint:** `GET /api/public/menus`
- **Xác thực (Auth):** Không yêu cầu (Public).
- **Cấu trúc dữ liệu:** Dạng cây (Tree structure).

### Dữ liệu trả về mẫu:
```json
[
  {
    "id": 190,
    "code": "public-home",
    "name": "Trang chủ",
    "path": "/",
    "icon": "🏠",
    "type": "route",
    "children": []
  },
  {
    "id": 200,
    "code": "public-comics-categories",
    "name": "Thể loại",
    "path": "/comics/categories",
    "icon": "📚",
    "type": "group",
    "children": [
      {
        "id": 201,
        "code": "public-comics-category-action",
        "name": "Hành động",
        "path": "/comics/categories/hanh-dong",
        "icon": "",
        "type": "route",
        "children": []
      },
      ...
    ]
  },
  {
    "id": 210,
    "code": "public-comics-new-updated",
    "name": "Mới cập nhật",
    "path": "/comics?sort=last_chapter_updated_at:desc",
    "icon": "🆕",
    "type": "route",
    "children": []
  }
]
```

---

## 2. Danh sách Menu đã cập nhật

Hệ thống đã được cập nhật các menu sau cho giao diện Client:

| Tên Menu | Path (Đường dẫn) | Icon | Mô tả |
| :--- | :--- | :--- | :--- |
| **Trang chủ** | `/` | 🏠 | Trang chủ website |
| **Thể loại** | `/comics/categories` | 📚 | Nhóm menu thể loại (Dạng dropdown) |
| -- Hành động | `/comics/categories/hanh-dong` | | Thể loại Hành động |
| -- Phiêu lưu | `/comics/categories/phieu-luu` | | Thể loại Phiêu lưu |
| -- Học đường | `/comics/categories/hoc-duong` | | Thể loại Học đường |
| -- Chuyển sinh | `/comics/categories/chuyen-sinh` | | Thể loại Chuyển sinh |
| **Mới cập nhật** | `/comics?sort=last_chapter_updated_at:desc` | 🆕 | Danh sách truyện mới cập nhật |
| **Truyện HOT** | `/comics?sort=view_count:desc` | 🔥 | Danh sách truyện có lượt xem cao |
| **Hoàn thành** | `/comics?status=completed` | ✅ | Danh sách truyện đã hoàn thành |
| **Tin tức** | `/posts` | 📰 | Trang tin tức/bài viết |

---

## 3. Hướng dẫn tích hợp cho FE

1. **Gọi API:** Gọi `GET /api/public/menus` khi lần đầu load website (có thể lưu vào Global State/Context hoặc Cache).
2. **Render Menu:**
   - Sử dụng trường `name` để hiển thị nhãn.
   - Sử dụng trường `path` để điều hướng (Client-side routing).
   - Nếu `type` là `group`, FE nên render dạng Dropdown hoặc Sub-menu sử dụng mảng `children`.
   - Các icon (emoji hoặc class name) được trả về trong trường `icon`.
3. **Phân loại:** Chỉ các menu có trường `group: "client"` trong database mới được trả về qua API này (Backend đã xử lý lọc sẵn).

---

## 4. Admin Menu (Lưu ý)
- Các menu dành cho Dashboard (Quản trị) sẽ gọi qua API `GET /api/admin/menus/tree` (Yêu cầu đăng nhập và phân quyền). Dữ liệu này hoàn toàn tách biệt với menu Public.
