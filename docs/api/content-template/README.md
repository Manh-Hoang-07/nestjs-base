# Content Template Module API Documentation

Module quản lý các mẫu nội dung (Templates) dùng cho Email, SMS, Telegram, Zalo, PDF, v.v. Hệ thống hỗ trợ biên dịch nội dung động bằng biến (Variables) sử dụng cú pháp `{{variable_name}}`.

## 📂 Cấu trúc Module

```
src/modules/core/content-template/
├── admin/              # Admin APIs (Quản lý templates)
└── services/           # Services dùng chung (Execution, Rendering)
```

---

## 🔐 Admin APIs

APIs dành cho quản trị viên để quản lý danh sách và nội dung các mẫu. Yêu cầu Authentication (Bearer Token) và quyền tương ứng.

### Content Templates (Mẫu nội dung)
- **GET** `/admin/content-templates` - Danh sách mẫu nội dung (có phân trang, tìm kiếm)
- **GET** `/admin/content-templates/:id` - Chi tiết mẫu nội dung theo ID
- **POST** `/admin/content-templates` - Tạo mới mẫu nội dung
- **PATCH** `/admin/content-templates/:id` - Cập nhật mẫu nội dung
- **DELETE** `/admin/content-templates/:id` - Xóa mẫu nội dung (Soft delete)
- **POST** `/admin/content-templates/:code/test` - Chạy thử (Execute) template theo mã code

📖 [Chi tiết Admin Content Templates API](./admin.md)

---

## 📊 Phân loại Templates

### 1. Template Category (Hạng mục)

| Value | Label | Mô tả |
|-------|-------|-------|
| `render` | Tự động biên dịch | Nội dung là text/html, sẽ được hệ thống parse và thay thế biến |
| `file` | Tập tin mẫu | Nội dung là file (.docx, .xlsx, .pdf) dùng làm mẫu để điền dữ liệu |

### 2. Template Type (Loại template)

Dựa trên kênh truyền tin hoặc định dạng xuất bản:

| Value | Label | Kênh/Định dạng |
|-------|-------|----------------|
| `email` | Email | Gửi Email qua SMTP |
| `telegram` | Telegram | Gửi tin nhắn qua Bot Telegram |
| `zalo` | Zalo | Gửi tin nhắn qua Zalo OA |
| `sms` | SMS | Gửi tin nhắn SMS OTP/Brandname |
| `pdf_generated` | PDF từ HTML | Sinh file PDF từ nội dung HTML |
| `file_word` | Word | File mẫu Microsoft Word |
| `file_excel` | Excel | File mẫu Microsoft Excel |
| `file_pdf` | PDF có sẵn | File PDF cố định |

### 3. Basic Status (Trạng thái)

| Value | Label |
|-------|-------|
| `active` | Hoạt động |
| `inactive` | Ngưng hoạt động |

---

## 🛠 Cách thức Rendering (Biên dịch)

Hệ thống sử dụng cú pháp Mustache-style cho các biến:
- Sử dụng `{{variable_name}}` trong nội dung template.
- Khi execute, truyền object `variables` chứa giá trị thực tế.

**Ví dụ nội dung:**
```html
<p>Xin chào {{name}}, mã xác thực của bạn là {{otp}}.</p>
```

**Variables truyền vào:**
```json
{
  "name": "Nguyễn Văn A",
  "otp": "123456"
}
```

---

## 📝 Ghi chú

- **Code:** Phải là duy nhất (unique), dùng để xác định template khi gọi từ code backend.
- **Metadata:** Lưu trữ cấu hình bổ sung (Ví dụ: `subject` cho Email).
- **Variables Field:** Lưu danh sách các biến mà template này đang sử dụng để hiển thị gợi ý cho người dùng ở FE.

---

**Last Updated:** 2026-01-26  
**API Version:** v1.0.0
