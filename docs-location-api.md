## Tài liệu tích hợp API Location

Tài liệu này mô tả các API location để FE tích hợp lấy danh sách **quốc gia (country)**, **tỉnh/thành (province)** và **phường/xã (ward)**.

Giả sử base URL của backend là: `https://your-domain.com/api`.

---

## 1. Public APIs (không cần token)

Các API public dùng cho FE phía client (website/app) không yêu cầu đăng nhập.

### 1.1. GET /public/location/countries — Danh sách quốc gia

- **Method**: `GET`
- **URL đầy đủ**: `/api/public/location/countries`

**Request**

- **Query params**
  - `page` (number, optional): trang hiện tại, mặc định `1`.
  - `limit` (number, optional): số bản ghi mỗi trang, mặc định `10`, tối đa `100`.
  - `name` (string, optional): filter theo tên quốc gia (LIKE `%name%`).
  - `code` (string, optional): filter theo mã quốc gia (ví dụ: `VN`).
  - `status` (string, optional): trạng thái (ví dụ: `active`).

**Response**

```json
{
  "data": [
    {
      "id": 1,
      "code": "VN",
      "code_alpha3": "VNM",
      "name": "Việt Nam",
      "official_name": "Cộng hòa Xã hội chủ nghĩa Việt Nam",
      "phone_code": "+84",
      "currency_code": "VND",
      "flag_emoji": "🇻🇳",
      "status": "active",
      "created_user_id": null,
      "updated_user_id": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "deleted_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pageCount": 1
  }
}
```

- **data**: mảng các bản ghi `Country` (đúng các field trong DB).
- **meta**: thông tin phân trang do `BaseService` sinh ra.

**Ví dụ request**

```bash
GET /api/public/location/countries?page=1&limit=50&status=active
```

```ts
const res = await fetch(
  'https://your-domain.com/api/public/location/countries?page=1&limit=50&status=active'
);
const json = await res.json();
const countries = json.data;
```

---

### 1.2. GET /public/location/provinces — Danh sách tỉnh/thành

- **Method**: `GET`
- **URL đầy đủ**: `/api/public/location/provinces`

**Request**

- **Query params**
  - `page` (number, optional)
  - `limit` (number, optional)
  - `name` (string, optional): filter theo tên tỉnh/thành.
  - `code` (string, optional): mã tỉnh/thành.
  - `status` (string, optional)
  - `country_id` (number/string, optional): ID quốc gia.

> Chú ý: backend dùng field `country_id` (snake_case) trong filter, nên FE gửi đúng key `country_id` (không phải `countryId`).

**Response**

```json
{
  "data": [
    {
      "id": 79,
      "code": "79",
      "name": "Hồ Chí Minh",
      "type": "Thành phố",
      "phone_code": "28",
      "country_id": 1,
      "status": "active",
      "note": null,
      "code_bnv": null,
      "code_tms": null,
      "created_user_id": null,
      "updated_user_id": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "deleted_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 63,
    "pageCount": 4
  }
}
```

**Ví dụ request**

```bash
GET /api/public/location/provinces?country_id=1&limit=100
```

```ts
const params = new URLSearchParams({
  country_id: '1',
  limit: '100'
});

const res = await fetch(
  `https://your-domain.com/api/public/location/provinces?${params.toString()}`
);
const json = await res.json();
const provinces = json.data;
```

---

### 1.3. GET /public/location/wards — Danh sách phường/xã

- **Method**: `GET`
- **URL đầy đủ**: `/api/public/location/wards`

**Request**

- **Query params**
  - `page` (number, optional)
  - `limit` (number, optional)
  - `name` (string, optional)
  - `code` (string, optional)
  - `status` (string, optional)
  - `province_id` (number/string, optional): ID tỉnh/thành.

> Chú ý: backend filter dùng `province_id` (snake_case).

**Response**

```json
{
  "data": [
    {
      "id": 1,
      "province_id": 79,
      "name": "Phường Bến Nghé",
      "type": "Phường",
      "code": "26734",
      "status": "active",
      "created_user_id": null,
      "updated_user_id": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "deleted_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 312,
    "pageCount": 7
  }
}
```

**Ví dụ request**

```bash
GET /api/public/location/wards?province_id=79&limit=100
```

```ts
const params = new URLSearchParams({
  province_id: '79',
  limit: '100'
});

const res = await fetch(
  `https://your-domain.com/api/public/location/wards?${params.toString()}`
);
const json = await res.json();
const wards = json.data;
```

---

## 2. Admin APIs (cần token)

Các API admin dùng cho màn hình quản trị, cần gửi `Authorization: Bearer <token>`.

Token có thể lấy từ endpoint login admin (test e2e đang dùng `/api/login` với email `systemadmin@example.com`).

### 2.1. GET /admin/location/countries — Danh sách quốc gia (admin)

- **Method**: `GET`
- **URL đầy đủ**: `/api/admin/location/countries`

**Request**

- **Headers**
  - `Authorization: Bearer <adminToken>`
- **Query params**
  - Giống public: `page`, `limit`, `name`, `code`, `status`.

**Response**

- Cùng cấu trúc với public:
  - `data`: mảng `Country`.
  - `meta`: thông tin phân trang.

---

### 2.2. GET /admin/location/provinces — Danh sách tỉnh/thành (admin)

- **Method**: `GET`
- **URL đầy đủ**: `/api/admin/location/provinces`

**Request**

- **Headers**
  - `Authorization: Bearer <adminToken>`
- **Query params**
  - `page`, `limit`, `name`, `code`, `status`, `country_id`.

**Response**

- Cùng cấu trúc với public `/public/location/provinces`.

---

### 2.3. GET /admin/location/wards — Danh sách phường/xã (admin)

- **Method**: `GET`
- **URL đầy đủ**: `/api/admin/location/wards`

**Request**

- **Headers**
  - `Authorization: Bearer <adminToken>`
- **Query params**
  - `page`, `limit`, `name`, `code`, `status`, `province_id`.

**Response**

- Cùng cấu trúc với public `/public/location/wards`.

---

### 2.4. Ví dụ gọi API admin (axios)

```ts
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://your-domain.com/api',
  headers: {
    Authorization: `Bearer ${adminToken}`
  }
});

// Lấy danh sách tỉnh/thành cho admin
const res = await client.get('/admin/location/provinces', {
  params: {
    page: 1,
    limit: 20,
    country_id: 1
  }
});

const provinces = res.data.data;
```

---

## 3. Tóm tắt để FE tích hợp nhanh

- **Base URL**: `https://your-domain.com/api`.
- **Public**:
  - `GET /public/location/countries`
  - `GET /public/location/provinces`
  - `GET /public/location/wards`
- **Admin** (kèm header `Authorization: Bearer <token>`):
  - `GET /admin/location/countries`
  - `GET /admin/location/provinces`
  - `GET /admin/location/wards`
- **Query hay dùng**: `page`, `limit`, `search`, `countryId`, `provinceId`, `orderBy`, `order`.
- **Response**: FE đọc dữ liệu chính trong `data` (mảng), thông tin phân trang trong `meta`.

---

## 4. Ghi chú

- Tài liệu này chỉ tập trung vào **API Location**.
- Các thay đổi/nâng cấp liên quan tới **địa chỉ trong DB (profile/order/warehouse/system-config)** được mô tả ở: `docs-address-upgrade.md`.
