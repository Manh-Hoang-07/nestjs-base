# HƯỚNG DẪN HIỂN THỊ VÀ CHUYỂN TRẠNG THÁI ĐỚN HÀNG CHO FRONTEND

## 1. CẤU TRÚC DỮ LIỆU TRẢ VỀ

Khi gọi API `GET /api/admin/orders/{id}`, response sẽ bao gồm:

```json
{
  "success": true,
  "data": {
    // Thông tin đơn hàng
    "id": 30,
    "order_number": "ORD-20260130-001",
    "status": "pending",              // Trạng thái hiện tại
    "payment_status": "pending",
    "shipping_status": "pending",
    
    // Metadata để hiển thị UI
    "available_statuses": [           // Các trạng thái có thể chuyển TIẾP THEO
      { "value": "confirmed", "label": "Đã xác nhận" },
      { "value": "cancelled", "label": "Đã hủy" }
    ],
    "all_order_statuses": [           // TẤT CẢ trạng thái (cho filter/reference)
      { "value": "pending", "label": "Chờ xác nhận" },
      { "value": "confirmed", "label": "Đã xác nhận" },
      { "value": "processing", "label": "Đang xử lý" },
      { "value": "shipped", "label": "Đã giao vận chuyển" },
      { "value": "delivered", "label": "Đã giao hàng" },
      { "value": "cancelled", "label": "Đã hủy" }
    ],
    "all_payment_statuses": [...],
    "all_shipping_statuses": [...]
  }
}
```

## 2. PHÂN BIỆT 2 TRƯỜNG QUAN TRỌNG

### 2.1. `available_statuses` - Trạng thái có thể chuyển
**Mục đích:** Hiển thị các **nút hành động** hoặc **dropdown chuyển trạng thái**

**Đặc điểm:**
- Chỉ chứa các trạng thái **hợp lệ** có thể chuyển từ trạng thái hiện tại
- Thay đổi tùy theo `status` hiện tại
- Dùng để **hạn chế** user chỉ chọn đúng trạng thái tiếp theo

**Ví dụ:**
- Nếu `status = "pending"` → `available_statuses = ["confirmed", "cancelled"]`
- Nếu `status = "delivered"` → `available_statuses = []` (không thể chuyển nữa)
- Nếu `status = "cancelled"` → `available_statuses = []` (không thể chuyển nữa)

### 2.2. `all_order_statuses` - Tất cả trạng thái
**Mục đích:** Hiển thị **filter**, **legend**, hoặc **timeline**

**Đặc điểm:**
- Luôn chứa đầy đủ tất cả trạng thái trong hệ thống
- Không thay đổi theo trạng thái hiện tại
- Dùng để **tham khảo** hoặc **filter** danh sách đơn hàng

## 3. HƯỚNG DẪN HIỂN THỊ GIAO DIỆN

### 3.1. Trang Chi Tiết Đơn Hàng (Order Detail Page)

#### A. Hiển thị Trạng Thái Hiện Tại
```jsx
// Tìm label của trạng thái hiện tại
const currentStatusLabel = order.all_order_statuses.find(
  s => s.value === order.status
)?.label || order.status;

// Hiển thị badge/tag
<Badge color="warning">{currentStatusLabel}</Badge>
// Kết quả: "Chờ xác nhận"
```

#### B. Hiển thị Nút Chuyển Trạng Thái (Recommended)
**Cách 1: Hiển thị từng nút riêng biệt**
```jsx
{order.available_statuses.map(status => (
  <Button 
    key={status.value}
    onClick={() => updateOrderStatus(order.id, status.value)}
  >
    Chuyển sang: {status.label}
  </Button>
))}
```

**Kết quả hiển thị:**
```
[Chuyển sang: Đã xác nhận]  [Chuyển sang: Đã hủy]
```

**Cách 2: Hiển thị dropdown**
```jsx
<Select 
  placeholder="Chuyển trạng thái"
  onChange={(value) => updateOrderStatus(order.id, value)}
>
  {order.available_statuses.map(status => (
    <Option key={status.value} value={status.value}>
      {status.label}
    </Option>
  ))}
</Select>
```

**Kết quả hiển thị:**
```
[Chuyển trạng thái ▼]
  ├─ Đã xác nhận
  └─ Đã hủy
```

#### C. Hiển thị Timeline/Progress (Optional)
Dùng `all_order_statuses` để hiển thị toàn bộ quy trình:

```jsx
<Timeline>
  {order.all_order_statuses
    .filter(s => !['cancelled'].includes(s.value)) // Loại bỏ trạng thái đặc biệt
    .map(status => (
      <Timeline.Item 
        key={status.value}
        color={status.value === order.status ? 'blue' : 'gray'}
        dot={status.value === order.status ? <CheckCircle /> : null}
      >
        {status.label}
        {status.value === order.status && ' (Hiện tại)'}
      </Timeline.Item>
    ))
  }
</Timeline>
```

**Kết quả hiển thị:**
```
✓ Chờ xác nhận (Hiện tại)
○ Đã xác nhận
○ Đang xử lý
○ Đã giao vận chuyển
○ Đã giao hàng
```

### 3.2. Trang Danh Sách Đơn Hàng (Order List Page)

#### A. Filter theo trạng thái
Dùng `all_order_statuses` từ **bất kỳ đơn hàng nào** hoặc gọi API `/api/public/order-constants`:

```jsx
<Select 
  placeholder="Lọc theo trạng thái"
  onChange={(value) => setStatusFilter(value)}
  allowClear
>
  {allOrderStatuses.map(status => (
    <Option key={status.value} value={status.value}>
      {status.label}
    </Option>
  ))}
</Select>
```

#### B. Hiển thị badge trong bảng
```jsx
<Table>
  <Column 
    title="Trạng thái"
    dataIndex="status"
    render={(status) => {
      const statusLabel = allOrderStatuses.find(s => s.value === status)?.label;
      return <Badge>{statusLabel}</Badge>;
    }}
  />
</Table>
```

## 4. LUỒNG CHUYỂN TRẠNG THÁI

### 4.1. API Endpoint
```http
PATCH /api/admin/orders/{id}/status
Content-Type: application/json

{
  "status": "confirmed",  // Giá trị từ available_statuses
  "notes": "Đã xác nhận đơn hàng"  // Optional
}
```

### 4.2. Code Mẫu (React/TypeScript)
```typescript
const updateOrderStatus = async (orderId: number, newStatus: string) => {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: newStatus,
        notes: '' // Có thể cho user nhập ghi chú
      })
    });

    if (response.ok) {
      // Reload lại chi tiết đơn hàng để cập nhật available_statuses mới
      await fetchOrderDetail(orderId);
      toast.success('Đã cập nhật trạng thái');
    }
  } catch (error) {
    toast.error('Lỗi khi cập nhật trạng thái');
  }
};
```

### 4.3. Lưu Ý Quan Trọng
1. **Luôn dùng `available_statuses`** để hiển thị các lựa chọn chuyển trạng thái
2. **Không cho phép** user chọn trạng thái không có trong `available_statuses`
3. **Sau khi chuyển trạng thái thành công**, gọi lại API chi tiết để lấy `available_statuses` mới
4. **Không hardcode** logic chuyển trạng thái ở FE, để BE quản lý

## 5. CÁC TRƯỜNG HỢP ĐẶC BIỆT

### 5.1. Đơn hàng đã hoàn thành (delivered)
```json
{
  "status": "delivered",
  "available_statuses": []  // Rỗng - không thể chuyển nữa
}
```

**Hiển thị:**
- Không hiển thị nút/dropdown chuyển trạng thái
- Chỉ hiển thị badge "Đã giao hàng"
- Có thể hiển thị thông báo: "Đơn hàng đã hoàn thành"

### 5.2. Đơn hàng đã hủy (cancelled)
```json
{
  "status": "cancelled",
  "available_statuses": []  // Rỗng - không thể chuyển nữa
}
```

**Hiển thị:**
- Tương tự như delivered
- Badge màu đỏ "Đã hủy"

### 5.3. Đơn hàng Digital (tự động delivered)
```json
{
  "order_type": "digital",
  "status": "delivered",
  "payment_status": "paid"
}
```

**Lưu ý:**
- Đơn digital tự động chuyển sang `delivered` khi thanh toán thành công
- Admin không cần can thiệp thủ công

## 6. MẪU GIAO DIỆN ĐỀ XUẤT

### Giao Diện Chi Tiết Đơn Hàng

```
┌─────────────────────────────────────────────────────┐
│ Đơn Hàng #ORD-20260130-001                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Trạng thái: [Chờ xác nhận]                         │
│                                                     │
│ Hành động:                                          │
│ ┌─────────────────┐  ┌──────────────┐              │
│ │ ✓ Xác nhận đơn  │  │ ✗ Hủy đơn    │              │
│ └─────────────────┘  └──────────────┘              │
│                                                     │
│ Hoặc:                                               │
│ [Chuyển trạng thái ▼]                               │
│   ├─ Đã xác nhận                                    │
│   └─ Đã hủy                                         │
│                                                     │
│ ─────────────────────────────────────────────────   │
│                                                     │
│ Tiến trình đơn hàng:                                │
│ ● Chờ xác nhận (Hiện tại)                           │
│ ○ Đã xác nhận                                       │
│ ○ Đang xử lý                                        │
│ ○ Đã giao vận chuyển                                │
│ ○ Đã giao hàng                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Giao Diện Danh Sách Đơn Hàng

```
┌─────────────────────────────────────────────────────┐
│ Lọc: [Tất cả trạng thái ▼]  [Tìm kiếm...]          │
├─────────────────────────────────────────────────────┤
│ Mã ĐH          │ Khách hàng  │ Trạng thái          │
├─────────────────────────────────────────────────────┤
│ ORD-001        │ Nguyễn A    │ [Chờ xác nhận]      │
│ ORD-002        │ Trần B      │ [Đang xử lý]        │
│ ORD-003        │ Lê C        │ [Đã giao hàng]      │
└─────────────────────────────────────────────────────┘
```

## 7. CHECKLIST CHO FRONTEND

- [ ] Hiển thị trạng thái hiện tại bằng badge/tag
- [ ] Chỉ hiển thị nút/dropdown chuyển trạng thái nếu `available_statuses.length > 0`
- [ ] Dùng `available_statuses` để tạo các option chuyển trạng thái
- [ ] Dùng `all_order_statuses` để tạo filter trong danh sách
- [ ] Sau khi chuyển trạng thái, reload lại chi tiết đơn hàng
- [ ] Hiển thị thông báo thành công/thất bại khi chuyển trạng thái
- [ ] Xử lý trường hợp `available_statuses = []` (đơn đã hoàn thành/hủy)
- [ ] (Optional) Hiển thị timeline/progress bar cho đơn hàng

## 8. FAQ

**Q: Tại sao không dùng `all_order_statuses` để chuyển trạng thái?**
A: Vì `all_order_statuses` chứa TẤT CẢ trạng thái, kể cả những trạng thái không hợp lệ. Ví dụ: đơn `pending` không thể chuyển thẳng sang `delivered`.

**Q: Có cần gọi API `/api/public/order-constants` không?**
A: Không bắt buộc. Mỗi đơn hàng đã có sẵn `all_order_statuses`. Chỉ cần gọi API constants nếu muốn cache 1 lần cho toàn app.

**Q: Khi nào `available_statuses` rỗng?**
A: Khi đơn hàng ở trạng thái cuối (`delivered` hoặc `cancelled`) - không thể chuyển tiếp nữa.

**Q: Có thể chuyển từ `cancelled` về `pending` không?**
A: Không. Backend đã chặn logic này. `available_statuses` của đơn `cancelled` sẽ rỗng.

**Q: Làm sao biết màu sắc cho từng trạng thái?**
A: FE tự định nghĩa theo design system của mình. Gợi ý:
- `pending`: Vàng/Orange
- `confirmed`: Xanh dương
- `processing`: Tím
- `shipped`: Xanh lá nhạt
- `delivered`: Xanh lá đậm
- `cancelled`: Đỏ
