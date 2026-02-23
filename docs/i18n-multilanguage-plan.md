## Chiến lược đa ngôn ngữ (i18n) cho backend NestJS

Backend hiện tại là nền tảng cho nhiều module (ecommerce, content, notification…). Việc chuẩn hóa **i18n** ngay từ bây giờ sẽ giúp mở rộng sang nhiều ngôn ngữ (vi, en, …) mà không phá vỡ API hoặc logic hiện có.

Tài liệu này đưa ra **định hướng kiến trúc** và **gợi ý thư viện/cách triển khai**, không phải checklist chi tiết từng bước code.

---

## 1. Mục tiêu & phạm vi

- **Mục tiêu**
  - Hỗ trợ đa ngôn ngữ cho:
    - Thông báo lỗi / message hệ thống (validation, exception, auth, order…).
    - Nội dung động trong DB (post, product, category, menu, homepage section…).
    - Email / notification template.
  - Dễ dàng thêm ngôn ngữ mới (chủ yếu thêm file resource, không sửa code nhiều).
  - Không làm vỡ backward compatibility với client hiện tại.

- **Phạm vi giai đoạn đầu**
  - Ưu tiên: **message hệ thống + validation + email/notification mẫu đơn giản**.
  - Sau đó: **đa ngôn ngữ cho nội dung DB** (post, product…).

---

## 2. Thư viện & cách tích hợp gợi ý

- **Thư viện đề xuất**: `nestjs-i18n`
  - Lý do:
    - Tích hợp tốt với NestJS (module, pipe, decorator).
    - Hỗ trợ **interceptor, pipe, guard** cho i18n.
    - Hỗ trợ **ICU message format** (plural, variables…).
  - Cài đặt (tham khảo):

```bash
npm install nestjs-i18n i18n
```

- **Kiến trúc tích hợp**
  - Tạo module `I18nModule` (có thể trong `src/core` hoặc `src/shared`):
    - Cấu hình source messages (JSON/YAML) theo cấu trúc:
      - `src/i18n/{lang}/{namespace}.json`
      - Ví dụ:
        - `src/i18n/vi/auth.json`
        - `src/i18n/en/auth.json`
        - `src/i18n/vi/validation.json`
        - `src/i18n/en/validation.json`
    - Đăng ký vào `AppModule` / `CoreModule` để toàn hệ thống dùng được.

---

## 3. Chiến lược xác định ngôn ngữ (language resolution)

Nên thống nhất **thứ tự ưu tiên** để xác định `lang` hiện tại của request:

1. **Query param**: `?lang=vi` hoặc `?locale=vi-VN`.
2. **Header** custom: `X-Lang` hoặc `X-Locale`.
3. **Accept-Language** header của HTTP.
4. **Ngôn ngữ lưu trên user profile** (nếu user đã login) – ví dụ field `preferred_language`.
5. Fallback: cấu hình default, ví dụ `vi`.

- **Đề xuất cách triển khai**
  - Sử dụng **i18n resolver** của `nestjs-i18n`:
    - `QueryResolver` (`lang`, `locale`).
    - `HeaderResolver` (`x-lang`, `accept-language`).
    - Custom resolver: đọc từ `req.user.preferredLanguage` nếu đã auth.
  - Cấu hình trong `I18nModule`:
    - danh sách `fallbackLanguage` (vd: `vi`).
    - `whitelist` các ngôn ngữ hỗ trợ (`['vi', 'en']`).

---

## 4. Phân loại nội dung đa ngôn ngữ

### 4.1. Message hệ thống / lỗi / validation

- **Đối tượng**:
  - Message từ `class-validator`.
  - Message từ custom exception (`HttpException`, `BusinessException`, …).
  - Thông báo auth, RBAC, payment, order, cart…

- **Định hướng**:
  - Tất cả message nên quy về **key i18n** (VD: `auth.invalid_credentials`, `validation.email_invalid`).
  - Không hard-code tiếng Việt/tiếng Anh trong service/controller.
  - Sử dụng:
    - `I18nService` trong service để translate theo key.
    - Interceptor / ExceptionFilter để map mã lỗi -> key i18n.

- **Gợi ý refactor từng bước**:
  1. Thống kê nhanh các nơi đang dùng message dạng text (search `"message: '"`, `throw new` với string, v.v.).
  2. Định nghĩa **bộ key chuẩn** theo domain:
     - `auth.*`, `order.*`, `product.*`, `cart.*`, `system.*`, `common.*`.
  3. Tạo file:
     - `src/i18n/vi/common.json`, `src/i18n/en/common.json`, …
  4. Dần dần thay thế string cũ bằng key + dùng `i18n.t('...')`.

### 4.2. Nội dung DB (Post, Product, Category, Menu, Homepage…)

Có 2 kiểu chính:

- **a) Nội dung marketing / SEO / blog / homepage** (thay đổi ít, cần dịch đầy đủ).
- **b) Nội dung transactional / tên ngắn** (tên sản phẩm, category…).

**Mô hình dữ liệu đề xuất**:

- **Option 1 – Bảng translation riêng (đề xuất cho hệ thống lớn)**
  - Ví dụ:
    - Bảng `posts` (giữ id, slug canonical, field chung).
    - Bảng `post_translations`:
      - `post_id`
      - `lang` (vi, en, …)
      - `title`, `content`, `excerpt`, `meta_title`, `meta_description`, …
  - Áp dụng tương tự cho: `products`, `categories`, `menus`, `homepage_sections`, …
  - Ưu điểm:
    - Mở rộng ngôn ngữ dễ, không phải thêm cột.
    - Dễ join/filter theo lang.

- **Option 2 – JSON field lưu multiple language**
  - Field `title_translations` dạng JSON: `{ "vi": "Tiếng Việt", "en": "English" }`.
  - Nhanh để triển khai, nhưng:
    - Truy vấn, filter, index khó hơn.
    - Thích hợp cho content ít, không cần filter phức tạp.

- **Định hướng chọn**:
  - Với hệ thống e-commerce + CMS khá lớn như hiện tại, **nên chọn Option 1 (bảng translation riêng)** cho các entity chính (product, category, post, menu).
  - Có thể dùng Option 2 cho các field phụ ít quan trọng (ví dụ: tooltip, help text hiếm khi query).

---

## 5. API design cho đa ngôn ngữ

- **Query param ngôn ngữ**:
  - Client gọi: `GET /api/posts?lang=vi` hoặc `GET /api/products?lang=en`.
  - Backend dùng resolver để set `lang` context, và repository/service tự filter theo `lang`.

- **Response structure**:
  - Ở level API public, **nên trả về text đã chọn 1 ngôn ngữ**, không nên trả `{ vi: ..., en: ... }` trừ endpoint quản trị.
  - Ví dụ:
    - `GET /api/posts?lang=en` -> `title` đã là tiếng Anh.
  - Với **admin API**, có thể:
    - Hoặc trả list translations đầy đủ (`translations: [{ lang, title, ... }]`).
    - Hoặc trả cấu trúc: `{ vi: {...}, en: {...} }` cho easy edit.

- **Backward compatibility**:
  - Nếu client cũ không truyền `lang`, backend sử dụng `fallbackLanguage` (`vi`) để đảm bảo không vỡ.
  - Khi thêm field translation mới, nên giữ field cũ trong 1 thời gian (deprecation strategy).

---

## 6. i18n cho Email / Notification

- **Hiện trạng**:
  - Hệ thống có module notification, contact, order… (xem docs dưới `docs/api/notification`, `docs/api/contact`, `docs/api/order...`).

- **Đề xuất**:
  - Dùng **template engine có hỗ trợ i18n**, ví dụ:
    - Handlebars + custom helper i18n.
    - Hoặc reuse `nestjs-i18n` để inject text.
  - Template email lưu theo:
    - `templates/email/{notificationType}/{lang}.hbs`
    - Ví dụ:
      - `templates/email/order-confirmation/vi.hbs`
      - `templates/email/order-confirmation/en.hbs`
  - Ở service gửi email/notification:
    - Lấy `lang` từ user hoặc request.
    - Chọn template theo `lang` + dữ liệu dynamic (tên user, số đơn hàng…).

---

## 7. Middleware / Guard / Decorator hỗ trợ i18n

- **Middleware/Guard**
  - Có thể viết 1 guard/middleware cho các route cần i18n:
    - Đọc `lang` từ resolver.
    - Đặt vào `request.lang` hoặc context chung (vd: `I18nContext`).

- **Decorator tiện dụng**
  - Tạo decorator `@Lang()` để inject ngôn ngữ vào controller method param.
  - Tạo decorator `@I18nMessage(key: string)` nếu muốn đơn giản hóa việc lấy message trong controller (cân nhắc, tránh over-magic).

- **Validation**
  - Sử dụng `nestjs-i18n` integration với `class-validator`:
    - Error message của `class-validator` → dùng key i18n, mapping tự động theo lang hiện tại.

---

## 8. Testing & E2E

- **Unit test**
  - Mock `I18nService` để test logic mà không cần load file thật.
  - Đảm bảo service chọn đúng key, không hard-code text.

- **E2E test**
  - Thêm một số test:
    - Gọi API với `?lang=vi` và `?lang=en`, assert message / title khác nhau.
    - Test fallback khi truyền lang không hỗ trợ (`?lang=jp` -> dùng `vi`).

- **Performance**
  - Dùng cache cho file translation (thư viện i18n thường có sẵn).
  - Không đọc file từ disk mỗi request.

---

## 9. Lộ trình triển khai gợi ý (roadmap)

**Phase 1 – Hạ tầng i18n**
- Cài `nestjs-i18n`, cấu hình `I18nModule`.
- Thiết lập resolvers (query, header, user).
- Thêm ít nhất 2 ngôn ngữ: `vi`, `en`.
- Tạo file resource cho `common`, `auth`, `validation`.

**Phase 2 – Message hệ thống & validation**
- Refactor dần:
  - Message validation (DTO, pipe).
  - Message từ auth, RBAC, common error.
- Thêm test e2e cơ bản cho `lang` khác nhau.

**Phase 3 – Nội dung DB (post, product, category, menu…)**
- Thiết kế bảng `*_translations` (có thể từng nhóm feature một để giảm risk).
- Cập nhật repository/service để query theo `lang`.
- Cập nhật API admin để quản lý nội dung nhiều ngôn ngữ.

**Phase 4 – Email / Notification & polishing**
- Tách template email/notification theo `lang`.
- Chuẩn hóa thông điệp log / audit (nếu cần hiển thị cho người dùng).
- Tối ưu cache, logging, monitoring cho i18n.

---

## 10. Gợi ý thực hành tốt (best practices)

- **Không hard-code text** trong service/controller – luôn thông qua i18n hoặc DB.
- **Tách rõ**:
  - Message hệ thống (i18n file).
  - Nội dung kinh doanh (DB translations).
- **Chuẩn hóa key i18n**: dùng snake-case hoặc dot-notation có namespace rõ (`auth.login_failed`, `order.out_of_stock`).
- **Document rõ cho FE**:
  - Cách truyền `lang` (query/header).
  - Hành vi fallback.
  - Endpoint nào đã hỗ trợ đa ngôn ngữ, endpoint nào chưa.

---

Nếu bạn muốn, có thể tạo thêm một `i18n-module` trong `src` và bắt đầu với 1–2 use case cụ thể (ví dụ: login error + post listing) để mình hỗ trợ chi tiết cấu trúc file, module và sample code integraton.


