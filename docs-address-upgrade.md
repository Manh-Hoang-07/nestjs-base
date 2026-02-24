# Nâng cấp địa chỉ dùng Location DB

Tài liệu này mô tả **các chỗ đã/đang nâng cấp địa chỉ** để sử dụng dữ liệu `Country/Province/Ward` trong DB (không trộn vào `docs-location-api.md` để tránh rối).

---

## 1. Tổng quan thay đổi

- **Profile (tài khoản)**: bổ sung `country_id/province_id/ward_id` vào bảng `profiles` + DTO cập nhật/tạo/sửa user.
- **Order (đặt hàng)**: chuẩn hóa `shipping_address/billing_address` theo DTO `OrderAddressDto` (giữ tương thích GHN).
- **Warehouse (kho hàng)**: bổ sung `country_id/province_id/ward_id` vào bảng `warehouses` + DTO tạo kho.
- **GeneralConfig (system-config/general)**: bổ sung `site_country_id/site_province_id/site_ward_id` vào bảng `general_configs` + DTO + service update.

> Lưu ý: App đang bật `ValidationPipe` với `whitelist: true`, nên **field không khai báo trong DTO sẽ bị strip**. Vì vậy DTO cho order address có thêm các field cũ `ward/district/city` để không làm vỡ luồng GHN.

---

## 2. DB schema (Prisma) đã thêm field nào?

### 2.1. `Profile` (`profiles`)

- Thêm:
  - `country_id BigInt?`
  - `province_id BigInt?`
  - `ward_id BigInt?`

Mục tiêu: profile user lưu được location ID để FE/BE dùng thống nhất với bảng `countries/provinces/wards`.

### 2.2. `Warehouse` (`warehouses`)

- Thêm:
  - `country_id BigInt?`
  - `province_id BigInt?`
  - `ward_id BigInt?`

Mục tiêu: kho hàng có thể gắn location ID (bên cạnh `address/city/district` dạng text).

### 2.3. `GeneralConfig` (`general_configs`)

- Thêm:
  - `site_country_id BigInt?`
  - `site_province_id BigInt?`
  - `site_ward_id BigInt?`

Mục tiêu: địa chỉ site (footer/contact) có thể gắn location ID trong DB.

---

## 3. API/DTO đã nâng cấp ở đâu?

### 3.1. User profile (tài khoản)

- **Endpoint**: `PATCH /api/user/profile`
- **DTO**: `UpdateProfileDto` nhận thêm:
  - `country_id?: number`
  - `province_id?: number`
  - `ward_id?: number`

Ngoài ra admin DTO:
- `CreateUserDto.profile` và `UpdateUserDto.profile` nhận thêm `country_id/province_id/ward_id`.

**Luồng lưu DB**:
- `ProfileController` đã map các field mới vào payload `profile`.
- `UserRepositoryImpl.upsertProfile()` đã cho phép upsert các field `country_id/province_id/ward_id`.

### 3.2. Đặt hàng (Order)

- **DTO**:
  - `CreateOrderDto.shipping_address` / `billing_address`
  - `UpdateOrderDto.shipping_address` / `billing_address`
  đều dùng `OrderAddressDto`.

**Cấu trúc `OrderAddressDto` (chuẩn dùng cho FE gửi lên)**:

```ts
type OrderAddressDto = {
  // Contact (optional)
  name?: string;
  phone?: string;
  email?: string;

  // Địa chỉ chi tiết
  address?: string; // field chuẩn (đồng nhất với Profile/Warehouse/Config)

  // Backward-compatible fields (GHNProvider đang dùng để format)
  ward?: string;
  district?: string;
  city?: string;

  // Location IDs (gắn DB location)
  country_id?: number;
  province_id?: number;
  ward_id?: number;

  // Optional cache name để hiển thị nhanh
  country_name?: string;
  province_name?: string;
  ward_name?: string;

  // GHN mapping (optional)
  district_id?: number;
  ward_code?: string;
};
```

**Ví dụ payload tạo order** (rút gọn):

```json
{
  "cart_uuid": "....",
  "shipping_method_id": 1,
  "payment_method_id": 1,
  "shipping_address": {
    "name": "Nguyễn Văn A",
    "phone": "0909xxxxxx",
    "address": "123 Lê Lợi",
    "country_id": 1,
    "province_id": 79,
    "ward_id": 12345,
    "city": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "district_id": 1442,
    "ward_code": "26734"
  }
}
```

> BE vẫn lưu `shipping_address/billing_address` dạng JSON trong DB như hiện tại. Điểm nâng cấp là **validate & chuẩn hóa shape** để đồng bộ với location DB và không bị strip field cần cho GHN.

### 3.3. Warehouse

- **DTO**: `CreateWarehouseDto` nhận thêm:
  - `country_id?: number`
  - `province_id?: number`
  - `ward_id?: number`

> Nếu có thêm DTO update kho (khác file), có thể nâng cấp tương tự (cùng các field trên) để đồng bộ hoàn toàn.

### 3.4. System-config / general (GeneralConfig)

- **DTO**: `UpdateGeneralConfigDto` nhận thêm:
  - `site_country_id?: number`
  - `site_province_id?: number`
  - `site_ward_id?: number`

- **Service**: `GeneralConfigService.updateConfig()` đã map các field này vào DB:
  - Khi tạo mới: set `BigInt(dto.site_*_id)` nếu có.
  - Khi update: nếu DTO không gửi thì giữ giá trị cũ; nếu gửi thì update.

---

## 4. Danh sách file đã thay đổi (để review nhanh)

- **Prisma**
  - `prisma/schema.prisma`

- **Profile / User**
  - `src/modules/core/iam/user/admin/dtos/update-profile.dto.ts`
  - `src/modules/core/iam/user/admin/dtos/create-user.dto.ts`
  - `src/modules/core/iam/user/admin/dtos/update-user.dto.ts`
  - `src/modules/core/iam/user/user/controllers/profile.controller.ts`
  - `src/modules/core/iam/user/infrastructure/repositories/user.repository.impl.ts`

- **Order**
  - `src/modules/ecommerce/order/public/dtos/create-order.dto.ts` (thêm `OrderAddressDto`)
  - `src/modules/ecommerce/order/admin/dtos/update-order.dto.ts` (dùng `OrderAddressDto`)

- **Warehouse**
  - `src/modules/ecommerce/warehouse/admin/dtos/create-warehouse.dto.ts`

- **System-config**
  - `src/modules/core/system-config/general/admin/dtos/update-general-config.dto.ts`
  - `src/modules/core/system-config/general/admin/services/general-config.service.ts`

---

## 5. Việc cần làm khi deploy

- Chạy migration DB (Prisma) để tạo các cột mới trong:
  - `profiles`
  - `warehouses`
  - `general_configs`

- FE cập nhật payload:
  - Profile update: gửi thêm `country_id/province_id/ward_id`.
  - Order create/update: gửi `shipping_address/billing_address` đúng `OrderAddressDto` (bao gồm `city/district/ward` nếu đang dùng GHN format hiện tại).
  - General config update: gửi `site_country_id/site_province_id/site_ward_id` nếu muốn gắn location cho địa chỉ site.

