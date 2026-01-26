# Introduction Module - API Documentation

Tài liệu tích hợp API module Introduction cho hệ thống.

## 📋 Tổng quan

Module Introduction bao gồm các API quản lý nội dung giới thiệu công ty, bao gồm:
- Dự án (Projects)
- Nhân viên (Staff)
- Gallery
- Đối tác (Partners)
- Lời chứng thực (Testimonials)
- Chứng chỉ (Certificates)
- Phần giới thiệu (About Sections)
- Câu hỏi thường gặp (FAQs)

## 🔐 Authentication

Tất cả các Admin API yêu cầu JWT Bearer Token:

```
Authorization: Bearer YOUR_TOKEN
```

## 📚 Danh sách API

### Admin APIs

#### 1. Dự án (Projects)
Quản lý các dự án của công ty.

**Base URL:** `/admin/projects`

**Tài liệu chi tiết:** [project.md](./admin/project.md)

**Endpoints:**
- `POST /admin/projects` - Tạo dự án mới
- `GET /admin/projects` - Lấy danh sách dự án
- `GET /admin/projects/:id` - Lấy chi tiết dự án
- `PUT /admin/projects/:id` - Cập nhật dự án
- `DELETE /admin/projects/:id` - Xóa dự án
- `PATCH /admin/projects/:id/status` - Thay đổi trạng thái
- `PATCH /admin/projects/:id/featured` - Đánh dấu nổi bật
- `PATCH /admin/projects/:id/sort-order` - Cập nhật thứ tự sắp xếp

---

#### 2. Nhân viên (Staff)
Quản lý thông tin nhân viên.

**Base URL:** `/admin/staff`

**Tài liệu chi tiết:** [staff.md](./admin/staff.md)

**Endpoints:**
- `POST /admin/staff` - Tạo nhân viên mới
- `GET /admin/staff` - Lấy danh sách nhân viên
- `GET /admin/staff/:id` - Lấy chi tiết nhân viên
- `PUT /admin/staff/:id` - Cập nhật nhân viên
- `DELETE /admin/staff/:id` - Xóa nhân viên

---

#### 3. Gallery
Quản lý thư viện ảnh.

**Base URL:** `/admin/gallery`

**Tài liệu chi tiết:** [gallery.md](./admin/gallery.md)

**Endpoints:**
- `POST /admin/gallery` - Tạo gallery mới
- `GET /admin/gallery` - Lấy danh sách gallery
- `GET /admin/gallery/:id` - Lấy chi tiết gallery
- `PUT /admin/gallery/:id` - Cập nhật gallery
- `DELETE /admin/gallery/:id` - Xóa gallery

---

#### 4. Đối tác (Partners)
Quản lý đối tác, khách hàng, nhà cung cấp.

**Base URL:** `/admin/partners`

**Tài liệu chi tiết:** [partner.md](./admin/partner.md)

**Endpoints:**
- `POST /admin/partners` - Tạo đối tác mới
- `GET /admin/partners` - Lấy danh sách đối tác
- `GET /admin/partners/:id` - Lấy chi tiết đối tác
- `PUT /admin/partners/:id` - Cập nhật đối tác
- `DELETE /admin/partners/:id` - Xóa đối tác

---

#### 5. Lời chứng thực (Testimonials)
Quản lý lời chứng thực từ khách hàng.

**Base URL:** `/admin/testimonials`

**Tài liệu chi tiết:** [testimonial.md](./admin/testimonial.md)

**Endpoints:**
- `POST /admin/testimonials` - Tạo lời chứng thực mới
- `GET /admin/testimonials` - Lấy danh sách lời chứng thực
- `GET /admin/testimonials/:id` - Lấy chi tiết lời chứng thực
- `PUT /admin/testimonials/:id` - Cập nhật lời chứng thực
- `DELETE /admin/testimonials/:id` - Xóa lời chứng thực
- `PATCH /admin/testimonials/:id/featured` - Đánh dấu nổi bật

---

#### 6. Chứng chỉ (Certificates)
Quản lý các chứng chỉ, giấy phép, giải thưởng.

**Base URL:** `/admin/certificates`

**Tài liệu chi tiết:** [certificate.md](./admin/certificate.md)

**Endpoints:**
- `POST /admin/certificates` - Tạo chứng chỉ mới
- `GET /admin/certificates` - Lấy danh sách chứng chỉ
- `GET /admin/certificates/:id` - Lấy chi tiết chứng chỉ
- `PUT /admin/certificates/:id` - Cập nhật chứng chỉ
- `DELETE /admin/certificates/:id` - Xóa chứng chỉ

---

#### 7. Phần giới thiệu (About Sections)
Quản lý các phần nội dung giới thiệu công ty.

**Base URL:** `/admin/about-sections`

**Tài liệu chi tiết:** [about-section.md](./admin/about-section.md)

**Endpoints:**
- `POST /admin/about-sections` - Tạo phần giới thiệu mới
- `GET /admin/about-sections` - Lấy danh sách phần giới thiệu
- `GET /admin/about-sections/:id` - Lấy chi tiết phần giới thiệu
- `PUT /admin/about-sections/:id` - Cập nhật phần giới thiệu
- `DELETE /admin/about-sections/:id` - Xóa phần giới thiệu

---

#### 8. Câu hỏi thường gặp (FAQs)
Quản lý câu hỏi thường gặp.

**Base URL:** `/admin/faqs`

**Tài liệu chi tiết:** [faq.md](./admin/faq.md)

**Endpoints:**
- `POST /admin/faqs` - Tạo FAQ mới
- `GET /admin/faqs` - Lấy danh sách FAQ
- `GET /admin/faqs/:id` - Lấy chi tiết FAQ
- `PUT /admin/faqs/:id` - Cập nhật FAQ
- `DELETE /admin/faqs/:id` - Xóa FAQ

---

## 🔑 Quyền truy cập

Tất cả các Admin API yêu cầu các quyền sau:

- `project.manage` - Quản lý dự án
- `staff.manage` - Quản lý nhân viên
- `gallery.manage` - Quản lý gallery
- `partner.manage` - Quản lý đối tác
- `testimonial.manage` - Quản lý lời chứng thực
- `certificate.manage` - Quản lý chứng chỉ
- `about.manage` - Quản lý phần giới thiệu
- `faq.manage` - Quản lý FAQ

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Thành công"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "statusCode": 400
}
```

---

## 📄 Pagination

Tất cả các API danh sách hỗ trợ phân trang:

```
GET /admin/projects?page=1&limit=10
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 🔍 Filtering & Sorting

### Filtering

```
GET /admin/projects?status=completed&featured=true
```

### Sorting

```
GET /admin/projects?sortBy=created_at&sortOrder=DESC
```

### Search

```
GET /admin/projects?search=ABC
```

---

## 📝 Lưu ý chung

1. **Soft Delete**: Tất cả các API xóa đều sử dụng soft delete (đánh dấu `deleted_at`), không xóa thực sự khỏi database.

2. **Slug tự động**: Các API có trường `slug` sẽ tự động sinh từ `title` hoặc `name` nếu không được cung cấp.

3. **Timestamps**: Tất cả các bản ghi đều có `created_at` và `updated_at` tự động.

4. **Status**: Hầu hết các module đều có trường `status` với giá trị `active` hoặc `inactive`.

5. **Sort Order**: Các module hỗ trợ sắp xếp thứ tự hiển thị thông qua trường `sort_order`.

---

## 🚦 Status Codes

| Code | Mô tả |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

---

## 📖 Tài liệu chi tiết

Xem các file markdown riêng biệt cho từng module:

- [Dự án (Projects)](./admin/project.md)
- [Nhân viên (Staff)](./admin/staff.md)
- [Gallery](./admin/gallery.md)
- [Đối tác (Partners)](./admin/partner.md)
- [Lời chứng thực (Testimonials)](./admin/testimonial.md)
- [Chứng chỉ (Certificates)](./admin/certificate.md)
- [Phần giới thiệu (About Sections)](./admin/about-section.md)
- [Câu hỏi thường gặp (FAQs)](./admin/faq.md)

---

**Last Updated:** 2025-01-15  
**API Version:** v1.0.0

