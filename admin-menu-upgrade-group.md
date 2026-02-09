# Tài liệu Nâng cấp Hệ thống Menu: Phân loại theo Group

Tài liệu này hướng dẫn cách sử dụng trường `group` mới trong hệ thống Menu để phân loại menu giữa giao diện Admin và Website (Client).

---

## 1. Thay đổi cấu trúc Database (Prisma)

Trường `group` đã được thêm vào model `Menu` để xác định menu đó thuộc về ngữ cảnh nào.

- **Trường mới:** `group`
- **Kiểu dữ liệu:** `String` (độ dài tối đa 50 ký tự)
- **Giá trị mặc định:** `'admin'`
- **Các giá trị quy ước:**
    - `'admin'`: Menu dành cho trang quản trị (Dashboard).
    - `'client'`: Menu dành cho giao diện Website (Public).

---

## 2. Cập nhật API và Logic Backend

### 2.1 API Public Menu
Hệ thống hiện tại đã lọc menu theo `group: 'client'` cho đầu public.
- **Endpoint:** `GET /api/public/menus`
- **Logic:** Tự động lấy các menu có `status: 'active'` và `group: 'client'`.

### 2.2 API Admin Menu
- **Endpoint:** `GET /api/admin/menus/tree`
- **Logic:** Lấy các menu có `group: 'admin'` (mặc định) và kiểm tra phân quyền RBAC cho người dùng đang đăng nhập.

---

## 3. Hướng dẫn sử dụng trong code (Seeder/Service)

### 3.1 Trong Seeder (`seed-menus.ts`)
Khi định nghĩa dữ liệu menu mới, bạn cần chỉ định rõ trường `group` nếu menu đó không phải là menu admin.

```typescript
{
  code: 'public-home',
  name: 'Trang chủ',
  path: '/',
  type: MenuType.route,
  group: 'client', // Quan trọng: Phân loại cho website
  is_public: true,
  show_in_menu: true,
}
```

### 3.2 Trong Service (`MenuService.ts`)
Khi sử dụng phương thức `getUserMenus`, bạn có thể truyền filter để lấy menu theo nhóm.

```typescript
// Lấy menu cho website
const clientMenus = await this.menuService.getUserMenus(userId, { group: 'client' });

// Lấy menu cho admin (mặc định)
const adminMenus = await this.menuService.getUserMenus(userId, { group: 'admin' });
```

---

## 4. Tác động đến giao diện Admin (Dashboard)

1. **Quản lý Menu:** Khi tạo hoặc chỉnh sửa menu trong giao diện Admin, cần thêm một trường (Select/Input) để chọn `Group`.
2. **Hiển thị:** Các menu Admin sẽ được lọc và xây dựng cây thư mục dựa trên quyền hạn của User, trong khi menu Client thường được hiển thị trực tiếp mà không cần cấu hình quyền phức tạp.

---

## 5. Lưu ý quan trọng
- Các menu cũ trong database sẽ mặc định là `admin` sau khi migrate.
- Khi thêm menu mới cho website, **bắt buộc** phải set `group: 'client'` để API Public có thể tìm thấy.
- Trường `group` này giúp tách biệt hoàn toàn dữ liệu menu giữa các nền tảng khác nhau nhưng vẫn quản lý chung trong một bảng duy nhất.
