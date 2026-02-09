# Kế hoạch phát triển chức năng Menu người dùng

Tài liệu này mô tả kế hoạch triển khai API lấy danh sách menu cho người dùng, hỗ trợ cả trường hợp đã đăng nhập và chưa đăng nhập (guest).

## 1. Phân tích yêu cầu

- **Đối tượng sử dụng**: 
  - **Khách (Guest)**: Chỉ thấy các menu công khai (`is_public = true`).
  - **Người dùng (Authenticated)**: Thấy các menu công khai VÀ các menu được phân quyền cụ thể.
- **Cấu trúc dữ liệu**: Trả về dạng cây (Tree).
- **Thông tin bổ sung**: Cần có trường xác định menu đó có yêu cầu đăng nhập hay không (dựa trên `is_public`).

## 2. Giải pháp kỹ thuật

### 2.1. Database Schema (Prisma)
Hiện tại model `Menu` đã có đủ các trường cần thiết:
- `is_public`: Boolean (mặc định false). Nếu true, menu dành cho cả khách.
- `required_permission_id`: Liên kết với quyền cụ thể.
- `status`: Để ẩn/hiện menu.

### 2.2. Service Layer (`MenuService`)
Cần refactor hàm `getUserMenus` để:
- Chấp nhận `userId` là optional (`number | bigint | null`).
- **Logic lọc menu**:
  - Lấy tất cả menu có `status = active` và `show_in_menu = true`.
  - Nếu không có `userId`: Chỉ giữ lại các menu có `is_public = true`.
  - Nếu có `userId`: Giữ lại các menu `is_public = true` HOẶC menu mà người dùng có quyền (thông qua `RBAC`).
- **Xử lý đệ quy**: Đảm bảo nếu menu cha bị ẩn thì các menu con cũng không hiển thị (hoặc ngược lại, tùy logic kinh doanh).

### 2.3. Controller Layers
Chúng ta tách biệt hoàn toàn hai luồng lấy menu:

1. **Admin Sidebar API (`admin/user/menus`)**:
   - Giữ nguyên bộ khung cũ để không làm hỏng Dashboard Admin hiện tại.
   - Luôn yêu cầu đăng nhập (`@Permission('authenticated')`).
   - Trả về danh sách menu Sidebar của Admin dựa trên quyền hạn.

2. **Public Menu API (`public/menus`)**:
   - API mới dành cho giao diện Website (Client).
   - Cho phép khách truy cập (`@Permission('public')`).
   - Tự động nhận diện User nếu có Token để trả về thêm các menu cá nhân (Lịch sử, Tủ truyện, v.v.).

## 3. Các bước thực hiện chi tiết

### Bước 1: Cập nhật `MenuService`
Chỉnh sửa file `src/modules/core/menu/admin/services/menu.service.ts`:
- Refactor `getUserMenus(userId?: number | bigint, options?: ...)` để xử lý trường hợp `userId` là null/undefined.
- Logic lọc: `m.is_public || (userId && hasPermission)`.

### Bước 2: Phân tách Controller và Module
- **Giữ nguyên `UserMenuController`**: Tại `src/modules/core/menu/user/`.
- **Tạo mới `PublicMenuModule` và `PublicMenuController`**: Tại thư mục mới `src/modules/core/menu/public/`.
- **Đăng ký**: Cập nhật `src/modules/core/menu/menu.module.ts` để nạp cả 3 module (Admin, User, Public).

### Bước 3: Định nghĩa cấu trúc trả về
Đảm bảo interface `MenuTreeItem` có thêm trường thông tin về yêu cầu đăng nhập:
```typescript
export interface MenuTreeItem {
  id: number;
  code: string;
  name: string;
  path: string | null;
  icon: string | null;
  is_public: boolean; // Hoặc login_required: boolean
  children?: MenuTreeItem[];
  // ...
}
```

## 4. Ví dụ kết quả trả về (JSON)

```json
[
  {
    "id": 1,
    "name": "Trang chủ",
    "path": "/",
    "is_public": true,
    "children": []
  },
  {
    "id": 2,
    "name": "Tủ truyện",
    "path": "/library",
    "is_public": false, 
    "children": []
  }
]
```

## 5. Kiểm thử (Test Cases)

1. **Guest**: Gọi API không có Header Authorization -> Chỉ nhận được các menu có `is_public: true`.
2. **User thường**: Đăng nhập tài khoản không có quyền Admin -> Nhận được menu `is_public: true` và các menu cá nhân (như "Tủ truyện", "Lịch sử").
3. **Admin**: Đăng nhập tài khoản Admin -> Nhận được toàn bộ menu được phân quyền.
