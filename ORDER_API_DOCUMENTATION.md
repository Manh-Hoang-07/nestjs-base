# TÀI LIỆU TÍCH HỢP API ĐỚN HÀNG (ORDER)

## 1. TỔNG QUAN HỆ THỐNG

Hệ thống đơn hàng hỗ trợ 3 loại đơn hàng:
- **Physical**: Đơn hàng vật lý (cần vận chuyển)
- **Digital**: Đơn hàng sản phẩm số (không cần vận chuyển, tự động giao sau thanh toán)
- **Mixed**: Đơn hàng kết hợp cả vật lý và số

## 2. TRẠNG THÁI ĐỚN HÀNG

### 2.1. Trạng thái chính (status)
```typescript
type OrderStatus = 
  | 'pending'      // Chờ xác nhận
  | 'confirmed'    // Đã xác nhận
  | 'processing'   // Đang xử lý
  | 'shipped'      // Đã giao vận chuyển
  | 'delivered'    // Đã giao hàng
  | 'cancelled';   // Đã hủy
```

### 2.2. Trạng thái thanh toán (payment_status)
```typescript
type PaymentStatus = 
  | 'pending'             // Chờ thanh toán
  | 'paid'                // Đã thanh toán
  | 'failed'              // Thanh toán thất bại
  | 'refunded'            // Đã hoàn tiền
  | 'partially_refunded'; // Hoàn tiền một phần
```

### 2.3. Trạng thái vận chuyển (shipping_status)
```typescript
type ShippingStatus = 
  | 'pending'     // Chờ chuẩn bị
  | 'preparing'   // Đang chuẩn bị
  | 'shipped'     // Đã giao vận chuyển
  | 'delivered'   // Đã giao hàng
  | 'returned';   // Đã trả hàng
```

## 3. LUỒNG ĐƠN HÀNG

### 3.1. Luồng COD (Cash On Delivery - Thanh toán khi nhận hàng)

**Đặc điểm:**
- `payment_method_id` = null hoặc payment_method có type = 'cod'
- Thanh toán khi nhận hàng
- Cần vận chuyển (chỉ áp dụng cho Physical/Mixed orders)

**Trạng thái:**
```
[Tạo đơn]
  ↓
pending (payment_status: pending, shipping_status: pending)
  ↓ [Admin xác nhận]
confirmed (payment_status: pending, shipping_status: preparing)
  ↓ [Admin chuẩn bị hàng]
processing (payment_status: pending, shipping_status: preparing)
  ↓ [Admin giao cho đơn vị vận chuyển]
shipped (payment_status: pending, shipping_status: shipped)
  ↓ [Khách nhận hàng và thanh toán]
delivered (payment_status: paid, shipping_status: delivered)
```

**Luồng hủy:**
- Khách hàng có thể hủy khi: `status = 'pending' | 'confirmed'`
- Admin có thể hủy bất kỳ lúc nào (trừ đã delivered)

### 3.2. Luồng Online Payment (VNPay, MoMo, etc.)

**Đặc điểm:**
- `payment_method_id` trỏ đến payment_method có type = 'online'
- Thanh toán trước
- Có thể là Physical, Digital hoặc Mixed

**Trạng thái cho Physical/Mixed:**
```
[Tạo đơn]
  ↓
pending (payment_status: pending, shipping_status: pending)
  ↓ [Khách thanh toán thành công qua cổng thanh toán]
confirmed (payment_status: paid, shipping_status: preparing)
  ↓ [Admin chuẩn bị hàng]
processing (payment_status: paid, shipping_status: preparing)
  ↓ [Admin giao cho đơn vị vận chuyển]
shipped (payment_status: paid, shipping_status: shipped)
  ↓ [Khách nhận hàng]
delivered (payment_status: paid, shipping_status: delivered)
```

**Trạng thái cho Digital (Tự động):**
```
[Tạo đơn]
  ↓
pending (payment_status: pending)
  ↓ [Khách thanh toán thành công]
delivered (payment_status: paid, shipping_status: delivered)
  ↓ [Hệ thống tự động gửi email với link download/thông tin sản phẩm]
```

**Luồng thanh toán thất bại:**
```
pending (payment_status: pending)
  ↓ [Thanh toán thất bại/timeout]
cancelled (payment_status: failed)
  ↓ [Tự động restore stock]
```

## 4. CƠ CHẾ TỰ ĐỘNG

### 4.1. Tự động chuyển trạng thái
- **Digital orders**: Khi `payment_status` chuyển sang `paid`, hệ thống tự động:
  - Chuyển `status` → `delivered`
  - Chuyển `shipping_status` → `delivered`
  - Set `delivered_at` = thời gian hiện tại
  - Gửi email chứa thông tin sản phẩm digital

### 4.2. Tự động gửi email
- Tạo đơn thành công → Email xác nhận
- Thanh toán thành công (Digital) → Email chứa link/thông tin sản phẩm
- Đơn hàng shipped → Email thông báo vận chuyển
- Đơn hàng delivered → Email xác nhận giao hàng

### 4.3. Quản lý tồn kho
- **Tạo đơn**: Tự động trừ stock (reserve)
- **Hủy đơn**: Tự động hoàn stock
- **Thanh toán thất bại**: Tự động hoàn stock

## 5. API ENDPOINTS

### 5.1. Public APIs (Khách hàng)

#### Tạo đơn hàng
```http
POST /api/public/orders
Content-Type: application/json

{
  "customer_name": "Nguyễn Văn A",
  "customer_email": "email@example.com",
  "customer_phone": "0123456789",
  "shipping_address": {
    "name": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "province": "TP.HCM",
    "country": "Vietnam"
  },
  "billing_address": { /* tương tự shipping_address */ },
  "shipping_method_id": 1,
  "payment_method_id": 2,  // null cho COD
  "notes": "Ghi chú đơn hàng",
  "cart_uuid": "uuid-of-cart"
}

Response:
{
  "success": true,
  "data": {
    "order_id": 123,
    "order_number": "ORD-20260130-001",
    "status": "pending",
    "total_amount": "500000",
    "items_count": 3,
    "access_url": "http://domain.com/api/public/orders/access?orderCode=ORD-20260130-001&hashKey=xxx"
  }
}
```

#### Lấy danh sách đơn hàng
```http
GET /api/public/orders?page=1&limit=10&status=pending
Authorization: Bearer {token}  // Optional, nếu có sẽ lọc theo user

Response:
{
  "success": true,
  "data": [
    {
      "id": 123,
      "order_number": "ORD-20260130-001",
      "status": "pending",
      "payment_status": "pending",
      "shipping_status": "pending",
      "total_amount": "500000",
      "created_at": "2026-01-30T00:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

#### Lấy chi tiết đơn hàng
```http
GET /api/public/orders/{id}
Authorization: Bearer {token}  // Optional

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "order_number": "ORD-20260130-001",
    "status": "pending",
    "payment_status": "pending",
    "shipping_status": "pending",
    "order_type": "physical",
    "customer_name": "Nguyễn Văn A",
    "customer_email": "email@example.com",
    "customer_phone": "0123456789",
    "shipping_address": { /* ... */ },
    "billing_address": { /* ... */ },
    "subtotal": "450000",
    "shipping_fee": "30000",
    "tax_amount": "20000",
    "discount_amount": "0",
    "total_amount": "500000",
    "items": [
      {
        "id": 1,
        "product_name": "Sản phẩm A",
        "variant_name": "Màu đỏ - Size M",
        "quantity": 2,
        "unit_price": "100000",
        "subtotal": "200000"
      }
    ],
    "created_at": "2026-01-30T00:00:00Z",
    "updated_at": "2026-01-30T00:00:00Z"
  }
}
```

#### Lấy đơn hàng qua access key (không cần đăng nhập)
```http
GET /api/public/orders/access?orderCode=ORD-20260130-001&hashKey=xxx

Response: Giống GET /api/public/orders/{id}
```

#### Hủy đơn hàng
```http
PUT /api/public/orders/{id}/cancel
Authorization: Bearer {token}  // Optional

Response:
{
  "success": true,
  "data": {
    "order_id": 123,
    "status": "cancelled"
  }
}
```

### 5.2. Admin APIs

#### Lấy danh sách đơn hàng (Admin)
```http
GET /api/admin/orders?page=1&limit=10&status=pending&paymentStatus=paid&shippingStatus=shipped
Authorization: Bearer {admin_token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: OrderStatus
- paymentStatus: PaymentStatus
- shippingStatus: ShippingStatus
- customerEmail: string
- startDate: ISO date string
- endDate: ISO date string

Response: Giống Public API
```

#### Lấy danh sách đơn giản (cho dropdown)
```http
GET /api/admin/orders/simple
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 123,
      "order_number": "ORD-20260130-001",
      "customer_name": "Nguyễn Văn A"
    }
  ]
}
```

#### Lấy chi tiết đơn hàng (Admin)
```http
GET /api/admin/orders/{id}
Authorization: Bearer {admin_token}

Response: Giống Public API nhưng có thêm các trường admin-only
```

#### Cập nhật trạng thái đơn hàng
```http
PATCH /api/admin/orders/{id}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "confirmed",  // pending | confirmed | processing | shipped | delivered | cancelled
  "notes": "Ghi chú khi đổi trạng thái"
}

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "order_number": "ORD-20260130-001",
    "status": "confirmed",
    "shipped_at": null,
    "delivered_at": null
  }
}
```

**Lưu ý về cập nhật trạng thái:**
- Khi chuyển sang `shipped`: Tự động set `shipped_at` = thời gian hiện tại
- Khi chuyển sang `delivered`: Tự động set `delivered_at` = thời gian hiện tại
- Không thể đổi trạng thái của đơn đã `cancelled` hoặc `delivered`

#### Cập nhật thông tin đơn hàng
```http
PATCH /api/admin/orders/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "customer_name": "Tên mới",
  "customer_phone": "0987654321",
  "shipping_address": { /* ... */ },
  "notes": "Ghi chú mới"
}

Response:
{
  "success": true,
  "data": { /* order object */ }
}
```

## 6. API LẤY DANH SÁCH TRẠNG THÁI

### Lấy tất cả constants (trạng thái, loại đơn hàng)
```http
GET /api/public/order-constants

Response:
{
  "success": true,
  "data": {
    "orderStatuses": [
      { "value": "pending", "label": "Chờ xác nhận", "color": "#FFA500" },
      { "value": "confirmed", "label": "Đã xác nhận", "color": "#4169E1" },
      { "value": "processing", "label": "Đang xử lý", "color": "#9370DB" },
      { "value": "shipped", "label": "Đã giao vận chuyển", "color": "#20B2AA" },
      { "value": "delivered", "label": "Đã giao hàng", "color": "#32CD32" },
      { "value": "cancelled", "label": "Đã hủy", "color": "#DC143C" }
    ],
    "paymentStatuses": [
      { "value": "pending", "label": "Chờ thanh toán", "color": "#FFA500" },
      { "value": "paid", "label": "Đã thanh toán", "color": "#32CD32" },
      { "value": "failed", "label": "Thanh toán thất bại", "color": "#DC143C" },
      { "value": "refunded", "label": "Đã hoàn tiền", "color": "#4169E1" },
      { "value": "partially_refunded", "label": "Hoàn tiền một phần", "color": "#9370DB" }
    ],
    "shippingStatuses": [
      { "value": "pending", "label": "Chờ chuẩn bị", "color": "#FFA500" },
      { "value": "preparing", "label": "Đang chuẩn bị", "color": "#4169E1" },
      { "value": "shipped", "label": "Đã giao vận chuyển", "color": "#20B2AA" },
      { "value": "delivered", "label": "Đã giao hàng", "color": "#32CD32" },
      { "value": "returned", "label": "Đã trả hàng", "color": "#DC143C" }
    ],
    "orderTypes": [
      { "value": "physical", "label": "Sản phẩm vật lý" },
      { "value": "digital", "label": "Sản phẩm số" },
      { "value": "mixed", "label": "Kết hợp" }
    ]
  }
}
```

**Lưu ý:** 
- API này không cần authentication
- FE nên gọi 1 lần khi khởi động app và cache lại
- Mỗi trạng thái có kèm `color` để hiển thị badge/tag

## 7. QUY TẮC NGHIỆP VỤ

### 7.1. Khách hàng
- Chỉ có thể hủy đơn khi `status = 'pending' | 'confirmed'`
- Chỉ xem được đơn hàng của mình (nếu đăng nhập) hoặc qua access_url

### 7.2. Admin
- Có thể xem tất cả đơn hàng
- Có thể cập nhật trạng thái thủ công
- Không thể đổi trạng thái của đơn đã `cancelled` hoặc `delivered`
- Có thể cập nhật thông tin đơn hàng (địa chỉ, ghi chú, etc.)

### 7.3. Tự động
- Digital orders: Tự động chuyển sang `delivered` khi thanh toán thành công
- Stock management: Tự động trừ/hoàn kho
- Email notifications: Tự động gửi theo từng trạng thái

## 8. LƯU Ý QUAN TRỌNG

1. **Access URL**: Mỗi đơn hàng có một access_url duy nhất để khách hàng có thể tra cứu mà không cần đăng nhập

2. **Payment Flow**: 
   - COD: Tạo đơn → Admin xử lý → Giao hàng → Thanh toán
   - Online: Tạo đơn → Thanh toán → Admin xử lý → Giao hàng

3. **Stock Management**: 
   - Stock được trừ ngay khi tạo đơn (reserve)
   - Stock được hoàn lại khi hủy đơn hoặc thanh toán thất bại

4. **Digital Products**:
   - Không cần vận chuyển
   - Tự động giao sau khi thanh toán thành công
   - Gửi email chứa thông tin/link download

5. **Error Handling**:
   - Tất cả thao tác đều trong transaction
   - Rollback tự động nếu có lỗi
   - Stock được restore nếu tạo đơn thất bại

## 9. RESPONSE FORMAT

Tất cả API đều trả về format chuẩn:

```typescript
{
  "success": boolean,
  "message": string,
  "code": string,
  "httpStatus": number,
  "data": any,
  "meta": any,
  "timestamp": string
}
```

Lỗi validation:
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "ERROR",
  "httpStatus": 400,
  "data": null,
  "meta": "Bad Request",
  "timestamp": "2026-01-30T00:00:00+07:00"
}
```
