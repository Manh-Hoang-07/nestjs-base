# Homepage API

API để lấy tất cả dữ liệu cần thiết cho trang chủ trong một lần gọi. API này kết hợp nhiều module thành một endpoint duy nhất để tối ưu hiệu suất và giảm số lượng request từ frontend.

## Cấu trúc

- **Base URL:** `http://localhost:3000/api/public/homepage`
- **Authentication:** **Không yêu cầu** (Public endpoint)
- **Headers:** `Content-Type: application/json`

---

## 1. Get Homepage Data (Lấy tất cả dữ liệu trang chủ)

Lấy tất cả dữ liệu cần thiết cho trang chủ trong một lần gọi. Mỗi block dữ liệu được cache riêng với TTL (Time To Live) khác nhau để tối ưu hiệu suất.

### Request

```bash
curl -X GET "http://localhost:3000/api/public/homepage" \
  -H "Content-Type: application/json"
```

### Query Parameters

Không có query parameters cho endpoint này.

### Response

**Success (200):**

Response được wrap bởi `TransformInterceptor` theo format chuẩn:

```json
{
  "success": true,
  "message": "Lấy dữ liệu trang chủ thành công.",
  "data": {
    "featured_projects": [
      {
        "id": "1",
        "name": "Dự án ABC",
        "slug": "du-an-abc",
        "description": "Mô tả chi tiết về dự án...",
        "short_description": "Mô tả ngắn gọn về dự án",
        "cover_image": "https://example.com/images/project-cover.jpg",
        "location": "Hà Nội, Việt Nam",
        "area": "5000.00",
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-12-31T00:00:00.000Z",
        "status": "completed",
        "client_name": "Khách hàng XYZ",
        "budget": "1000000.00",
        "images": [
          "https://example.com/images/project-1.jpg",
          "https://example.com/images/project-2.jpg"
        ],
        "featured": true,
        "view_count": "150",
        "sort_order": 1,
        "meta_title": "Dự án ABC - Tiêu đề SEO",
        "meta_description": "Mô tả SEO cho dự án ABC",
        "canonical_url": "https://example.com/projects/du-an-abc",
        "og_image": "https://example.com/images/og-project.jpg",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "about_sections": [
      {
        "id": "1",
        "title": "Lịch sử hình thành",
        "slug": "lich-su-hinh-thanh",
        "content": "Nội dung chi tiết về lịch sử...",
        "image": "https://example.com/images/about-history.jpg",
        "video_url": null,
        "section_type": "history",
        "status": "active",
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      },
      {
        "id": "2",
        "title": "Sứ mệnh",
        "slug": "su-menh",
        "content": "Nội dung về sứ mệnh công ty...",
        "image": null,
        "video_url": "https://example.com/videos/mission.mp4",
        "section_type": "mission",
        "status": "active",
        "sort_order": 2,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "staff": [
      {
        "id": "1",
        "name": "Nguyễn Văn A",
        "position": "Giám đốc Điều hành",
        "department": "Ban Giám đốc",
        "bio": "Tiểu sử về nhân viên...",
        "avatar": "https://example.com/images/staff-avatar-1.jpg",
        "email": "nguyen.van.a@company.com",
        "phone": "+84 123 456 789",
        "social_links": {
          "facebook": "https://facebook.com/nguyenvana",
          "linkedin": "https://linkedin.com/in/nguyenvana"
        },
        "experience": 10,
        "expertise": "Quản lý, Chiến lược, Phát triển kinh doanh",
        "status": "active",
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "featured_testimonials": [
      {
        "id": "1",
        "client_name": "Nguyễn Văn B",
        "client_position": "Giám đốc",
        "client_company": "Công ty ABC",
        "client_avatar": "https://example.com/images/client-avatar-1.jpg",
        "content": "Chúng tôi rất hài lòng với chất lượng dịch vụ...",
        "rating": 5,
        "project_id": "1",
        "featured": true,
        "status": "active",
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "partners": [
      {
        "id": "1",
        "name": "Công ty Đối tác ABC",
        "logo": "https://example.com/images/partner-logo-1.png",
        "website": "https://partner-abc.com",
        "description": "Mô tả về đối tác...",
        "type": "partner",
        "status": "active",
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "featured_gallery": [
      {
        "id": "1",
        "title": "Thư viện ảnh sự kiện 2024",
        "slug": "thu-vien-anh-su-kien-2024",
        "description": "Mô tả về thư viện ảnh...",
        "cover_image": "https://example.com/images/gallery-cover-1.jpg",
        "images": [
          "https://example.com/images/gallery-1.jpg",
          "https://example.com/images/gallery-2.jpg",
          "https://example.com/images/gallery-3.jpg"
        ],
        "featured": true,
        "status": "active",
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "certificates": [
      {
        "id": "1",
        "name": "Chứng nhận ISO 9001:2015",
        "image": "https://example.com/images/certificate-iso.jpg",
        "issued_by": "Tổ chức Chứng nhận ABC",
        "issued_date": "2023-01-01T00:00:00.000Z",
        "expiry_date": "2026-01-01T00:00:00.000Z",
        "certificate_number": "ISO-9001-2023-001",
        "description": "Chứng nhận hệ thống quản lý chất lượng",
        "type": "iso",
        "status": "active",
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      }
    ],
    "popular_faqs": [
      {
        "id": "1",
        "question": "Dịch vụ của các bạn là gì?",
        "answer": "Chúng tôi cung cấp các dịch vụ về...",
        "view_count": "250",
        "helpful_count": "180",
        "status": "active",
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

### Response Fields

#### `featured_projects` (Array)
Danh sách **10 dự án nổi bật** mặc định. Cache: **10 phút**

- `id` (string): ID dự án (BigInt được convert sang string)
- `name` (string): Tên dự án
- `slug` (string): URL slug của dự án
- `description` (string|null): Mô tả chi tiết
- `short_description` (string|null): Mô tả ngắn gọn
- `cover_image` (string|null): Ảnh cover
- `location` (string|null): Địa điểm
- `area` (string|null): Diện tích (Decimal)
- `start_date` (string|null): Ngày bắt đầu (ISO 8601)
- `end_date` (string|null): Ngày kết thúc (ISO 8601)
- `status` (string): Trạng thái (`planning`, `in_progress`, `completed`, `cancelled`)
- `client_name` (string|null): Tên khách hàng
- `budget` (string|null): Ngân sách (Decimal)
- `images` (array|null): Mảng các ảnh dự án (JSON)
- `featured` (boolean): Có phải dự án nổi bật không
- `view_count` (string): Số lượt xem (BigInt được convert sang string)
- `sort_order` (number): Thứ tự sắp xếp
- `meta_title` (string|null): Tiêu đề SEO
- `meta_description` (string|null): Mô tả SEO
- `canonical_url` (string|null): URL canonical
- `og_image` (string|null): Ảnh Open Graph
- `created_at` (string): Ngày tạo (ISO 8601)
- `updated_at` (string): Ngày cập nhật (ISO 8601)

#### `about_sections` (Array)
Danh sách **tối đa 20 phần giới thiệu**. Cache: **1 giờ**

- `id` (string): ID phần giới thiệu
- `title` (string): Tiêu đề
- `slug` (string): URL slug
- `content` (string): Nội dung HTML
- `image` (string|null): Ảnh minh họa
- `video_url` (string|null): URL video
- `section_type` (string): Loại phần (`history`, `mission`, `vision`, `values`, `culture`, `achievement`, `other`)
- `status` (string): Trạng thái (`active`, `inactive`)
- `sort_order` (number): Thứ tự sắp xếp
- `created_at` (string): Ngày tạo
- `updated_at` (string): Ngày cập nhật

#### `staff` (Array)
Danh sách **tối đa 20 nhân viên**. Cache: **30 phút**

- `id` (string): ID nhân viên
- `name` (string): Tên nhân viên
- `position` (string): Chức vụ
- `department` (string|null): Phòng ban
- `bio` (string|null): Tiểu sử
- `avatar` (string|null): Ảnh đại diện
- `email` (string|null): Email
- `phone` (string|null): Số điện thoại
- `social_links` (object|null): Liên kết mạng xã hội (JSON)
  - `facebook` (string|null)
  - `linkedin` (string|null)
  - `twitter` (string|null)
  - etc.
- `experience` (number|null): Số năm kinh nghiệm
- `expertise` (string|null): Chuyên môn
- `status` (string): Trạng thái (`active`, `inactive`)
- `sort_order` (number): Thứ tự sắp xếp
- `created_at` (string): Ngày tạo
- `updated_at` (string): Ngày cập nhật

#### `featured_testimonials` (Array)
Danh sách **10 lời chứng thực nổi bật**. Cache: **10 phút**

- `id` (string): ID lời chứng thực
- `client_name` (string): Tên khách hàng
- `client_position` (string|null): Chức vụ khách hàng
- `client_company` (string|null): Công ty khách hàng
- `client_avatar` (string|null): Ảnh đại diện khách hàng
- `content` (string): Nội dung lời chứng thực
- `rating` (number|null): Đánh giá (1-5 sao)
- `project_id` (string|null): ID dự án liên quan
- `featured` (boolean): Có phải nổi bật không
- `status` (string): Trạng thái (`active`, `inactive`)
- `sort_order` (number): Thứ tự sắp xếp
- `created_at` (string): Ngày tạo
- `updated_at` (string): Ngày cập nhật

#### `partners` (Array)
Danh sách **tối đa 20 đối tác**. Cache: **1 giờ**

- `id` (string): ID đối tác
- `name` (string): Tên đối tác
- `logo` (string): Logo đối tác
- `website` (string|null): Website đối tác
- `description` (string|null): Mô tả
- `type` (string): Loại đối tác (`client`, `supplier`, `partner`)
- `status` (string): Trạng thái (`active`, `inactive`)
- `sort_order` (number): Thứ tự sắp xếp
- `created_at` (string): Ngày tạo
- `updated_at` (string): Ngày cập nhật

#### `featured_gallery` (Array)
Danh sách **10 gallery nổi bật**. Cache: **5 phút**

- `id` (string): ID gallery
- `title` (string): Tiêu đề
- `slug` (string): URL slug
- `description` (string|null): Mô tả
- `cover_image` (string|null): Ảnh cover
- `images` (array): Mảng các ảnh (JSON, bắt buộc)
- `featured` (boolean): Có phải nổi bật không
- `status` (string): Trạng thái (`active`, `inactive`)
- `sort_order` (number): Thứ tự sắp xếp
- `created_at` (string): Ngày tạo
- `updated_at` (string): Ngày cập nhật

#### `certificates` (Array)
Danh sách **tối đa 20 chứng chỉ**. Cache: **1 giờ**

- `id` (string): ID chứng chỉ
- `name` (string): Tên chứng chỉ
- `image` (string): Ảnh chứng chỉ
- `issued_by` (string|null): Tổ chức cấp
- `issued_date` (string|null): Ngày cấp (ISO 8601)
- `expiry_date` (string|null): Ngày hết hạn (ISO 8601)
- `certificate_number` (string|null): Số chứng chỉ
- `description` (string|null): Mô tả
- `type` (string): Loại chứng chỉ (`iso`, `award`, `license`, `certification`, `other`)
- `status` (string): Trạng thái (`active`, `inactive`)
- `sort_order` (number): Thứ tự sắp xếp
- `created_at` (string): Ngày tạo
- `updated_at` (string): Ngày cập nhật

#### `popular_faqs` (Array)
Danh sách **10 câu hỏi thường gặp phổ biến** (sắp xếp theo view_count). Cache: **20 phút**

- `id` (string): ID FAQ
- `question` (string): Câu hỏi
- `answer` (string): Câu trả lời
- `view_count` (string): Số lượt xem (BigInt được convert sang string)
- `helpful_count` (string): Số lượt đánh giá hữu ích (BigInt được convert sang string)
- `status` (string): Trạng thái (`active`, `inactive`)
- `sort_order` (number): Thứ tự sắp xếp
- `created_at` (string): Ngày tạo
- `updated_at` (string): Ngày cập nhật

---

## 💾 Cache Strategy

Mỗi block dữ liệu được cache riêng với TTL (Time To Live) khác nhau để tối ưu hiệu suất:

| Block | Cache TTL | Lý do |
|-------|-----------|-------|
| `featured_projects` | 10 phút | Dự án thay đổi không thường xuyên |
| `about_sections` | 1 giờ | Giới thiệu ít thay đổi |
| `staff` | 30 phút | Nhân viên có thể thay đổi |
| `featured_testimonials` | 10 phút | Lời chứng thực |
| `partners` | 1 giờ | Đối tác ít thay đổi |
| `featured_gallery` | 5 phút | Gallery có thể cập nhật |
| `certificates` | 1 giờ | Chứng chỉ ít thay đổi |
| `popular_faqs` | 20 phút | FAQs |

**Lưu ý:** 
- Dữ liệu được fetch song song (parallel) để tối ưu thời gian phản hồi
- Cache được tự động làm mới khi hết hạn
- Khi admin cập nhật dữ liệu, cache sẽ được xóa tự động (thông qua các service methods)

---

## 📝 Ví dụ sử dụng với JavaScript/TypeScript

### Fetch API

```javascript
async function getHomepageData() {
  try {
    const response = await fetch('http://localhost:3000/api/public/homepage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      // Use data.featured_projects, data.about_sections, etc.
    }
  } catch (error) {
    // Handle error
  }
}
```

### Axios

```typescript
import axios from 'axios';

interface HomepageData {
  featured_projects: Project[];
  about_sections: AboutSection[];
  staff: Staff[];
  featured_testimonials: Testimonial[];
  partners: Partner[];
  featured_gallery: Gallery[];
  certificates: Certificate[];
  popular_faqs: Faq[];
}

async function getHomepageData(): Promise<HomepageData | null> {
  try {
    const response = await axios.get<{
      success: boolean;
      message: string;
      data: HomepageData;
    }>('http://localhost:3000/api/public/homepage');

    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    // Handle error
    return null;
  }
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface HomepageData {
  featured_projects: any[];
  about_sections: any[];
  staff: any[];
  featured_testimonials: any[];
  partners: any[];
  featured_gallery: any[];
  certificates: any[];
  popular_faqs: any[];
}

function useHomepage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomepage() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/public/homepage');
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to load homepage data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHomepage();
  }, []);

  return { data, loading, error };
}

// Usage in component
function HomePage() {
  const { data, loading, error } = useHomepage();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <section>
        <h2>Dự án nổi bật</h2>
        {data.featured_projects.map(project => (
          <div key={project.id}>{project.name}</div>
        ))}
      </section>
      
      <section>
        <h2>Giới thiệu</h2>
        {data.about_sections.map(section => (
          <div key={section.id}>{section.title}</div>
        ))}
      </section>
      
      {/* ... other sections ... */}
    </div>
  );
}
```

---

## ⚠️ Error Handling

### Error Response Format

Tất cả lỗi được trả về theo format chuẩn của hệ thống:

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "error": "Error code hoặc chi tiết lỗi",
  "statusCode": 500
}
```

### Common Error Codes

- `500`: Lỗi server nội bộ
- `503`: Service unavailable (khi database không khả dụng)

### Xử lý lỗi trong Frontend

```typescript
try {
  const response = await fetch('http://localhost:3000/api/public/homepage');
  const result = await response.json();

  if (!result.success) {
    // Handle error
    // Show error message to user
    return;
  }

  // Use result.data
} catch (error) {
  // Handle network error
}
```

---

## 🔄 Best Practices

1. **Cache ở Frontend:** Vì API đã được cache ở backend, bạn có thể cache thêm ở frontend để giảm số lượng request (ví dụ: cache 5-10 phút).

2. **Error Handling:** Luôn xử lý lỗi và hiển thị thông báo phù hợp cho người dùng.

3. **Loading States:** Hiển thị loading state khi đang fetch dữ liệu.

4. **Fallback Data:** Có thể chuẩn bị dữ liệu fallback khi API không khả dụng.

5. **TypeScript Types:** Sử dụng TypeScript để định nghĩa types cho response data để có type safety.

---

## 📌 Lưu ý quan trọng

1. **BigInt Fields:** Các trường `id`, `view_count`, `helpful_count` được trả về dưới dạng string (BigInt được serialize thành string).

2. **Decimal Fields:** Các trường `area`, `budget` được trả về dưới dạng string (Decimal được serialize thành string).

3. **JSON Fields:** Các trường `images`, `social_links` là JSON objects, cần parse khi sử dụng.

4. **Empty Arrays:** Nếu không có dữ liệu, các mảng sẽ trả về `[]` (mảng rỗng), không phải `null`.

5. **Date Fields:** Tất cả các trường date được trả về dưới dạng ISO 8601 string (ví dụ: `"2024-01-01T00:00:00.000Z"`).

---

## 🔗 Related APIs

Nếu cần lấy chi tiết hoặc danh sách đầy đủ của từng module, bạn có thể sử dụng các API riêng:

- **Projects:** `GET /api/projects` hoặc `GET /api/projects/featured`
- **About:** `GET /api/about-sections`
- **Staff:** `GET /api/staff`
- **Testimonials:** `GET /api/testimonials` hoặc `GET /api/testimonials/featured`
- **Partners:** `GET /api/partners`
- **Gallery:** `GET /api/gallery` hoặc `GET /api/gallery/featured`
- **Certificates:** `GET /api/certificates`
- **FAQs:** `GET /api/faqs` hoặc `GET /api/faqs/popular`

---

## 📞 Support

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ backend team.

