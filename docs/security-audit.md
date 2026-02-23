## Đánh giá bảo mật hệ thống NestJS

### 1. Tổng quan
- **Kiến trúc**: Ứng dụng NestJS modular, có tách `core`, `common`, `modules`, sử dụng Prisma, Redis, hàng đợi Bull, mailer, upload file…
- **Mục tiêu**: Đánh giá nhanh các vấn đề bảo mật chính (cấu hình app, auth/JWT, rate limiting, CORS, HTTP hardening, validation, logging, secrets, file upload) dựa trên source code hiện tại.

### 2. Điểm mạnh hiện tại
- **Cấu hình & secrets**
  - **ConfigModule global + Joi schema**: `CoreModule` dùng `ConfigModule.forRoot` với `validationSchema` bằng Joi, bắt buộc các biến quan trọng như `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DB_USERNAME`, `DB_DATABASE`… và có default hợp lý.
  - **Tách file cấu hình**: Có các file `app.config.ts`, `jwt.config.ts`, `mail.config.ts`, `storage.config.ts`, `google-oauth.config.ts`, dễ quản lý và review config.
- **HTTP hardening**
  - **Helmet + HPP + body size limit + compression**: `applyHttpHardening` dùng `helmet`, `hpp`, `body-parser` với `limit`, giúp giảm rủi ro XSS cơ bản, HTTP Parameter Pollution, và tấn công DOS do payload lớn.
- **CORS**
  - **CORS cấu hình hóa**: `applyCors` nhận cấu hình từ `ConfigService` (`app.corsEnabled`, `app.corsOrigins`), có phân biệt wildcard `*` và tự disable `credentials` khi dùng `*`, tránh lỗi cấu hình phổ biến.
- **Validation & bảo vệ dữ liệu vào**
  - **Global ValidationPipe**: `applyGlobalPipes` kích hoạt `ValidationPipe` global với `whitelist: true`, `transform: true`, `enableImplicitConversion`, ngăn chặn field thừa và type sai.
  - **Custom error format**: Dùng `ResponseUtil.validationError` để chuẩn hóa lỗi validation, dễ log/monitor.
- **Xác thực & JWT**
  - **JwtModule.registerAsync + ConfigService**: JWT secret, issuer, audience, expiresIn được lấy từ config, không hardcode trong code.
  - **Token blacklist service**: `TokenBlacklistService` hỗ trợ blacklist token (Redis + in-memory fallback) với cleanup định kỳ.
- **Rate limiting / attempt limiter**
  - **AttemptLimiterService**: Sử dụng Redis + ENV (`SECURITY_ATTEMPT_*`) để giới hạn số lần thử, khóa tạm thời theo scope + identifier (thường dùng cho login / reset password).
- **Log & giám sát**
  - **Custom logger + file logs**: `CustomLoggerService` được gắn vào app, có thư mục `logs` theo ngày, tách `app.log`, `error.log`, `auth_login.log`, `api-requests.log`, tiện cho audit/bảo mật.

### 3. Rủi ro & điểm cần lưu ý
- **3.1. CORS & nguồn truy cập**
  - `app.config.ts` đang cho phép:
    - `corsEnabled` mặc định `true`.
    - `corsOrigins`:
      - Nếu có `CORS_ORIGINS`: split theo dấu phẩy.
      - Nếu không có và `NODE_ENV === 'production'`: set `['https://yourdomain.com']` (placeholder, cần đổi).
      - Ngược lại (dev): **`['*']`**.
  - **Rủi ro**:
    - Nếu deploy production mà không set `CORS_ORIGINS`, rất dễ quên đổi `'https://yourdomain.com'` hoặc vô tình để `*` (ở môi trường dev), tạo điều kiện cho XSS qua domain khác, CSRF từ front-end không kiểm soát.

- **3.2. Thông tin môi trường & secrets**
  - Joi yêu cầu `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DB_USERNAME`, `DB_DATABASE`, nhưng:
    - Chưa thấy enforce về độ mạnh của password DB (`DB_PASSWORD` cho phép `''`).
    - Không thấy rule về độ dài/độ phức tạp của `JWT_SECRET` ngoài `min(16)` (cũng ổn nhưng vẫn cần enforce từ DevOps).
  - **Rủi ro**:
    - Dev có thể set secret yếu (ví dụ `1234567890123456`), dễ brute-force/guess.
    - Nếu `.env` bị commit/git leak (chưa kiểm tra `.gitignore` ở đây), toàn bộ hệ thống có thể bị compromise.

- **3.3. Rate limiting ở cấp HTTP**
  - Dự án có cài `@nestjs/throttler` và `rate-limiter-flexible` trong `package.json`, nhưng:
    - Chưa thấy cấu hình global Throttler trong `main.ts` hoặc `CoreModule`.
  - **Rủi ro**:
    - API (đặc biệt login, đăng ký, OTP, quên mật khẩu) có thể bị brute force hoặc bị spam với volume lớn nếu không có rate limit toàn cục hay per-IP.

- **3.4. Validation & error messages**
  - `ValidationPipe` global để `disableErrorMessages: false` (luôn hiển thị thông tin lỗi chi tiết).
  - **Rủi ro**:
    - Ở môi trường production, nếu trả full lỗi validation ra ngoài, kèm structure chi tiết của DTO, có thể tiết lộ cấu trúc nội bộ cho attacker. Tuy chưa phải critical, nhưng nên xem xét giảm chi tiết.

- **3.5. File upload & storage**
  - Dự án có `file-upload` module, `local-storage.strategy.ts`, `s3-storage.strategy.ts`, `file-validation.service.ts`.
  - Chưa review chi tiết từng validator của file, nhưng:
    - `STORAGE_MAX_FILE_SIZE` có validate min/max bằng Joi, đây là điểm tốt.
    - Cần đảm bảo:
      - Giới hạn mime-type chặt chẽ (không cho upload file thực thi).
      - Không cho upload trực tiếp vào thư mục public có thể thực thi script.
  - **Rủi ro tiềm tàng**:
    - Nếu validate mime-type không đúng hoặc chỉ dựa vào extension, có thể bị upload file độc hại.

- **3.6. Ghi log & dữ liệu nhạy cảm**
  - Log khá chi tiết (request, auth login, error).
  - **Rủi ro**:
    - Nếu log chứa token, password (khi debug), OTP hoặc PII (email, số điện thoại), cần có chiến lược ẩn/redact.

- **3.7. Sử dụng `*` trong corsOrigins môi trường dev**
  - `corsOrigins` dev = `['*']` là hợp lý cho dev, nhưng:
    - Dễ bị quên cấu hình khi deploy staging/production.
    - Nếu staging dùng ENV giống dev, có thể vô tình để `*` cho môi trường gần production.

### 4. Đề xuất cải thiện cụ thể

- **4.1. CORS & môi trường**
  - **Thiết lập rõ ràng ENV cho production**:
    - Ở `.env.production` (hoặc env thực tế):
      - `NODE_ENV=production`
      - `CORS_ENABLED=true`
      - `CORS_ORIGINS=https://your-real-frontend.com,https://another-frontend.com`
  - **Đề xuất cập nhật `app.config.ts`**:
    - Thay `['https://yourdomain.com']` bằng một giá trị rõ ràng hơn hoặc bắt buộc phải set thông qua ENV (nếu không set thì throw error).
  - **Áp dụng kiểm tra khi bootstrap**:
    - Nếu `environment === 'production'` mà `corsOrigins` chứa `*` thì log cảnh báo mức `error` hoặc throw exception để tránh deploy sai.

- **4.2. JWT & secrets**
  - **Policy về secret**:
    - Đảm bảo `JWT_SECRET`, `JWT_REFRESH_SECRET` được sinh bằng tool/bí mật đủ mạnh (ít nhất 32 ký tự random).
  - **Quy định vận hành**:
    - `.env` tuyệt đối không commit, phải có `.gitignore`.
    - Khi nghi ngờ secret lộ, thay toàn bộ secret + revoke token hiện tại (có `TokenBlacklistService` hỗ trợ).

- **4.3. Rate limiting toàn hệ thống**
  - **Kích hoạt `@nestjs/throttler`**:
    - Tạo `ThrottlerModule.forRootAsync` trong `AppModule/CoreModule` hoặc module riêng cho security.
    - Thiết lập rate limit mặc định (ví dụ 100 requests/5m per IP).
  - **Áp dụng decorator cho endpoint nhạy cảm**:
    - Login, register, forgot password, OTP verify nên có limit chặt hơn (ví dụ 5–10 requests/5m/IP/email).
  - **Kết hợp với `AttemptLimiterService`**:
    - Dùng `AttemptLimiterService` để chặn theo user/email/phone ngoài limit IP, tăng độ an toàn.

- **4.4. Validation & error detail**
  - **Ẩn bớt chi tiết lỗi ở production**:
    - Trong `applyGlobalPipes`, có thể:
      - Nếu `options.production === true`, set `disableErrorMessages: true` hoặc custom exception chỉ trả message chung (ví dụ `Validation failed`) và log chi tiết ở server.
  - **Log nội bộ đầy đủ, trả ra client vừa đủ**:
    - Giữ `ResponseUtil.validationError` nhưng giảm trường nhạy cảm trả ra bên ngoài.

- **4.5. File upload**
  - **Rà lại `file-validation.service.ts`**:
    - Đảm bảo:
      - Chỉ cho phép mime-type cần thiết (vd: `image/jpeg`, `image/png`, `application/pdf`…).
      - Chặn các type như `application/x-php`, `text/html`, `application/javascript` nếu không cần.
  - **Path lưu file**:
    - Đảm bảo file upload không nằm trong thư mục có thể thực thi code (đặc biệt trên server PHP/Apache cũ hoặc nếu có reverse proxy sai cấu hình).

- **4.6. Logging & PII**
  - **Redact dữ liệu nhạy cảm**:
    - Sửa `CustomLoggerService`/middleware log request để:
      - Ẩn/bỏ qua field `password`, `token`, `authorization`, `otp`, v.v.
  - **Retention policy**:
    - Thiết lập thời gian giữ log phù hợp, xóa log cũ tự động (thông qua cron/task ngoài NestJS).

- **4.7. Quy trình vận hành & môi trường**
  - **Tách rõ env theo môi trường**:
    - `development`: CORS có thể `*`, log nhiều, error chi tiết.
    - `staging`: CORS theo domain staging, error giảm bớt detail.
    - `production`: CORS strict, error message tối giản, log structured.
  - **Check list trước deploy**:
    - `NODE_ENV`, `CORS_ORIGINS`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL/DB_*`, `REDIS_URL`, `STORAGE_*`, `GOOGLE_*` được set đúng môi trường (không dùng giá trị dev).

### 5. Kết luận
- **Tổng thể**, hệ thống của bạn đã áp dụng khá nhiều best practice bảo mật cho backend NestJS:
  - Global config + validation, HTTP hardening, validation pipe, JWT theo config, token blacklist, attempt limiter, logging chi tiết.
- **Điểm cần cải thiện chủ yếu**:
  - Siết chặt CORS cho production, bổ sung rate limit toàn cục bằng `@nestjs/throttler`, chuẩn hóa chính sách secrets, rà lại upload/file validation và logging của dữ liệu nhạy cảm.
- Nếu bạn muốn, có thể tiếp theo tạo thêm `security-checklist.md` dạng checklist ngắn cho team DevOps/Dev kiểm tra trước mỗi lần deploy.


