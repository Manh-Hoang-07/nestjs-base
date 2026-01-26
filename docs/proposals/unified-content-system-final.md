# Đề xuất Giải pháp: Hệ thống Quản trị Nội dung & Mẫu Tài liệu Đa phương thức (Unified Content & Document System)

## 1. Tổng quan
Hệ thống này được thiết kế để quản lý tất cả các loại nội dung tương tác với người dùng (Email, tin nhắn OTT) và các mẫu tài liệu (Hợp đồng, Báo cáo, Chứng chỉ). Hệ thống hỗ trợ cả việc render nội dung từ biến (Text/HTML) và quản lý các file mẫu (Template Files) để người dùng tải xuống hoặc hệ thống tự điền dữ liệu.

## 2. Cấu trúc Cơ sở dữ liệu (Flexible Schema)

Model `ContentTemplate` sẽ quản lý cả hai loại: **Nội dung render (Text-based)** và **File mẫu (File-based)**.

```prisma
enum TemplateCategory {
  render   // Nội dung được render từ text/html (Email, Tele, Zalo, PDF từ HTML)
  file     // File mẫu có sẵn (Word, Excel, PDF form) để người dùng tải lên/xuống
}

enum TemplateType {
  email
  telegram
  zalo
  sms
  pdf_generated    // Sinh từ HTML content
  file_word        // File mẫu .docx
  file_excel       // File mẫu .xlsx
  file_pdf         // File mẫu .pdf có sẵn
}

model ContentTemplate {
  id              BigInt           @id @default(autoincrement()) @db.UnsignedBigInt
  code            String           @unique @db.VarChar(100)
  name            String           @db.VarChar(255)
  category        TemplateCategory @default(render)
  type            TemplateType
  
  // 1. Dành cho loại 'render': Lưu nội dung HTML/Markdown/Text
  content         String?          @db.LongText
  
  // 2. Dành cho loại 'file': Lưu đường dẫn file mẫu đã upload (ví dụ: /uploads/templates/contract_v1.docx)
  file_path       String?          @db.VarChar(500)
  
  // Cấu hình bổ sung (Subject email, Header, Cấu hình trang PDF...)
  metadata        Json?        
  
  // Danh sách biến mẫu khả dụng (Ví dụ: { "customer_name": "Tên khách", "amount": "Số tiền" })
  variables       Json?        
  
  status          BasicStatus      @default(active)
  created_at      DateTime         @default(now()) @db.DateTime(0)
  updated_at      DateTime         @updatedAt @db.DateTime(0)
  deleted_at      DateTime?        @db.DateTime(0)

  @@map("content_templates")
}
```

## 3. Kiến trúc Xử lý linh hoạt

Hệ thống sẽ chia làm 2 nhánh xử lý chính dựa trên `Category`:

### A. Nhánh "Render" (Thông báo & Email)
- **Đầu vào**: Code template + Dữ liệu (Payload).
- **Xử lý**: Lấy `content` từ DB -> Chèn biến vào -> Gửi qua Provider (Email, Tele, Zalo).
- **Ứng dụng**: Gửi OTP, thông báo đơn hàng, tin nhắn chúc mừng.

### B. Nhánh "File" (Quản lý & Tự động điền tài liệu)
- **Đầu vào**: Admin Upload file mẫu (.docx, .xlsx) lên hệ thống.
- **Xử lý**: 
    1. **Tải xuống trực tiếp**: Người dùng có thể chỉnh sửa file mẫu trên máy tính rồi upload bản cuối.
    2. **Auto-fill (Nâng cao)**: Hệ thống sử dụng thư viện (như `docxtemplater`) để đọc file mẫu từ `file_path`, thay thế các biến trong file bằng dữ liệu thật, sau đó xuất ra file mới cho người dùng.
- **Ứng dụng**: Mẫu hợp đồng chuẩn, mẫu báo cáo tháng, mẫu sơ yếu lý lịch.

## 4. Giao diện Quản trị (Admin UI)
- **Loại Render**: Tích hợp một trình soạn thảo Rich Text (Editor) để sửa nội dung trực tiếp.
- **Loại File**: Tích hợp nút **"Tải lên file mẫu"** và **"Quản lý phiên bản"**. Admin có thể xem danh sách các biến cần có trong file để hướng dẫn người dùng sử dụng file mẫu đúng cách.

## 5. Lợi ích của giải pháp
- **Tính tổng quát cực cao**: Quản lý được cả thông báo điện tử và hồ sơ giấy tờ truyền thống.
- **Tính tùy biến**: Cho phép người dùng linh hoạt giữa việc "Hệ thống tự tạo file" hoặc "Người dùng tự sửa file mẫu của hệ thống".
- **Dễ mở rộng**: Sau này muốn thêm loại file mới (ví dụ Powerpoint) hay kênh gửi mới (ví dụ Slack) chỉ cần thêm vào Enum và logic xử lý mà không cần thay đổi cấu trúc bảng.

---
**Nhận xét**: Việc thêm phần `file_path` và phân loại `render/file` giúp hệ thống giải quyết được bài toán "mẫu tài liệu" một cách triệt để, không chỉ dừng lại ở văn bản thuần túy.
