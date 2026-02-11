# Kế hoạch nâng cấp hệ thống Ecommerce Bán Sản phẩm số (Account Selling)

Tài liệu này mô tả chi tiết các bước cần thực hiện để nâng cấp module Ecommerce hiện tại, chuyển đổi từ mô hình bán hàng vật lý thông thường sang mô hình bán tài khoản tự động (Digital Account Selling) với tính năng gửi email thông tin sản phẩm sau khi thanh toán.

## 1. Mở rộng Cấu trúc Dữ liệu (Prisma Schema)

Cần bổ sung bảng để lưu trữ kho tài khoản (Assets) chưa bán và liên kết chúng với đơn hàng sau khi giao dịch thành công.

```prisma
// Thêm model mới vào schema.prisma
model ProductDigitalAsset {
  id                 BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  product_id         BigInt   @db.UnsignedBigInt
  product_variant_id BigInt?  @db.UnsignedBigInt
  
  // Thông tin tài khoản (Nên lưu dưới dạng JSON hoặc String đã mã hóa)
  // Ví dụ: "user|pass" hoặc "license_key"
  content            String   @db.Text 
  
  // Trạng thái: available (Sẵn sàng), reserved (Đang giữ cho đơn hàng chờ), sold (Đã bán)
  status             String   @default("available") @db.VarChar(30)
  
  // Liên kết đơn hàng sau khi bán
  order_item_id      BigInt?  @unique @db.UnsignedBigInt
  sold_at            DateTime? @db.DateTime(0)
  
  created_at         DateTime @default(now()) @db.DateTime(0)
  updated_at         DateTime @updatedAt @db.DateTime(0)

  // Relations
  product     Product    @relation(fields: [product_id], references: [id], onDelete: Cascade)
  order_item  OrderItem? @relation(fields: [order_item_id], references: [id], onDelete: SetNull)

  @@index([product_id, status])
  @@map("product_digital_assets")
}

// Cần thêm relation vào model OrderItem
// model OrderItem {
//   ...
//   digital_asset ProductDigitalAsset?
// }
```

## 2. Xây dựng Module Quản lý Kho Digital (Admin)

Cần tạo các API để quản trị viên có thể nhập hàng (Import accounts).

- **API Import:** Hỗ trợ nhập danh sách tài khoản theo lô (Bulk upload) qua file CSV hoặc Text area.
- **Service Logic:** Khi nhập hàng, hệ thống sẽ kiểm tra `product_id` và lưu dữ liệu vào bảng `ProductDigitalAsset`.
- **Security:** Triển khai một `EncryptionService` để mã hóa trường `content` trước khi lưu vào database, bảo vệ dữ liệu nếu database bị lộ.

## 3. Nâng cấp Luồng Tự động hóa Đơn hàng (Automation)

Sửa đổi `OrderAutomationService` để thực hiện việc "Bàn giao tài khoản" ngay khi đơn hàng được xác nhận thanh toán (Online hoặc Admin xác nhận tay).

### Logic thực hiện:
1.  **Kiểm tra loại đơn hàng:** Nếu đơn hàng có `order_type: 'digital'`.
2.  **Gán Tài khoản (Assignment):** 
    *   Duyệt qua danh sách `OrderItem`.
    *   Với mỗi item, lấy ra $N$ bản ghi từ `ProductDigitalAsset` có trạng thái `available`.
    *   Cập nhật các bản ghi đó sang `status: 'sold'` và gán `order_item_id`.
3.  **Xử lý nếu hết kho:** Nếu kho `available` không đủ, cần ghi log/alert cho Admin và đánh dấu đơn hàng cần xử lý thủ công (hoặc hoàn tiền).

## 4. Email Automation & Giao diện Người dùng

Cần nâng cấp cách thức gửi email và cho phép người dùng xem lại thông tin đã mua.

- **Email Template:** Sử dụng template HTML chuyên nghiệp. Nội dung email sẽ bao gồm bảng danh sách các tài khoản/key đã được giải mã từ bước gán tài khoản.
- **User Dashboard:** 
    *   Trong trang chi tiết đơn hàng (Frontend), bổ sung phần hiển thị thông tin Digital Assets đã mua.
    *   API `GetOrderDetails` của người dùng cần được `Left Join` với bảng `ProductDigitalAsset` để lấy dữ liệu.

## 5. Lộ trình Triển khai (Roadmap)

- **Ngày 1:** Cập nhật Prisma Schema, chạy Migration và tạo `EncryptionService`.
- **Ngày 2:** Xây dựng API Admin (Thêm/Sửa/Xóa/Import kho tài khoản).
- **Ngày 3:** Nâng cấp `OrderAutomationService` (Logic gán key + Email template).
- **Ngày 4:** Kiểm thử luồng thanh toán thực tế (Sandbox) và Verify email nhận được.
- **Ngày 5:** Tối ưu hiệu năng (Index database) và viết tài liệu vận hành cho Admin.

## 6. Lưu ý về Bảo mật Production
- **Encryption Key:** Khóa mã hóa phải được lưu trong `.env` và không được commit lên Git.
- **Rate Limit:** Chặn các API check kho để tránh việc hacker dò tìm số lượng hàng còn lại.
- **Auto-Backup:** Database cần được backup thường xuyên vì dữ liệu sản phẩm số là dữ liệu "biến động nhanh" và có giá trị cao.
