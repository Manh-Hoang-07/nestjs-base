# Tài liệu API Đăng ký và Quên mật khẩu (OTP qua Email)

Tài liệu này hướng dẫn cách tích hợp các API đăng ký tài khoản và khôi phục mật khẩu sử dụng mã xác thực OTP gửi qua Email.

## Luồng nghiệp vụ chung

1. **Gửi OTP**: Người dùng nhập Email -> Gọi API gửi OTP.
2. **Thực hiện nghiệp vụ**: Người dùng nhập thông tin (mật khẩu, v.v.) + Mã OTP -> Gọi API đăng ký hoặc đổi mật khẩu.
3. **Xác thực**: Backend kiểm tra OTP trong Redis. Nếu đúng mới thực hiện lưu vào Database.

---

## 1. Đăng ký tài khoản

### Bước 1: Gửi mã OTP đăng ký
Gửi mã OTP đến email người dùng để xác nhận email trước khi đăng ký.

- **Endpoint**: `POST /auth/register/send-otp`
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Phản hồi**:
  - `200 OK`: `{"message": "Mã OTP đã được gửi đến email của bạn."}`
  - `400 Bad Request`: Email đã tồn tại hoặc không hợp lệ.

### Bước 2: Thực hiện đăng ký
Sau khi có mã OTP, gửi toàn bộ thông tin để tạo tài khoản.

- **Endpoint**: `POST /auth/register`
- **Body**:
```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "otp": "123456"
}
```
- **Phản hồi**:
  - `201 Created`: Trả về thông tin user đã tạo.
  - `400 Bad Request`: Mã OTP sai, hết hạn hoặc dữ liệu không hợp lệ.

---

## 2. Quên mật khẩu

### Bước 1: Gửi mã OTP khôi phục mật khẩu
Gửi mã OTP đến email người dùng nếu email đó tồn tại trong hệ thống.

- **Endpoint**: `POST /auth/forgot-password/send-otp` (Hoặc dùng `POST /auth/forgot-password` - cả hai đều hoạt động như nhau)
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Phản hồi**:
  - `200 OK`: `{"message": "Mã OTP đã được gửi đến email của bạn."}`
  - `400 Bad Request`: Email không tồn tại trong hệ thống.

### Bước 2: Đổi mật khẩu mới
Dùng mã OTP đã nhận để thiết lập mật khẩu mới.

- **Endpoint**: `POST /auth/reset-password`
- **Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```
- **Phản hồi**:
  - `200 OK`: `{"message": "Đổi mật khẩu thành công."}`
  - `400 Bad Request`: Mã OTP sai, hết hạn hoặc mật khẩu xác nhận không khớp.

---

## Lưu ý cho Frontend

1. **Hiệu lực OTP**: Mã OTP có hiệu lực trong **5 phút**.
2. **Giới hạn (Throttling)**:
   - API gửi OTP giới hạn tối đa **2 lần/phút** cho mỗi IP để tránh spam.
   - API Login/Register giới hạn **5 lần/phút**.
3. **Cấu hình Email**: Đảm bảo Backend đã được cấu hình SMTP trong phần "Cấu hình hệ thống" -> "Email Config" thì mới gửi được mail thật. Nếu chưa cấu hình, API sẽ trả về lỗi 500.

## Mã lỗi thường gặp
- `400`: Dữ liệu gửi lên không đúng định dạng (Class Validator).
- `429`: Quá nhiều yêu cầu (Rate limit).
- `500`: Lỗi cấu hình Mail server hoặc lỗi server.
