# Tài liệu Tích hợp API Nhập Kho & Xuất Kho

Tài liệu này mô tả các API endpoints dành cho tính năng **Nhập kho (Import)** và **Xuất kho (Export)**.
Các API này tuân thủ chuẩn response chung của hệ thống.

---

## 1. Định nghĩa chung

### Trạng thái phiếu (Status)
Các phiếu nhập/xuất kho sẽ có quy trình trạng thái tương tự chuyển kho:
*   `pending`: Phiếu mới tạo, đang chờ duyệt (Chưa ảnh hưởng tồn kho).
*   `approved`: Đã duyệt (Đã cập nhật tồn kho).
*   `cancelled`: Đã hủy.

---

## 2. Quản lý Nhập Kho (Warehouse Imports)
*Mục đích: Nhập hàng từ nhà cung cấp hoặc nhập hàng cân bằng kho.*

### 2.1. Danh sách phiếu nhập
**GET** `/api/admin/warehouse-imports`

**Params:**
| Tên | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `page` | number | Không | Trang hiện tại (Mặc định 1) |
| `limit` | number | Không | Số lượng nhận về (Mặc định 10) |
| `warehouse_id` | number | Không | Lọc theo kho nhập |
| `status` | string | Không | Lọc theo trạng thái (`pending`, `approved`, `cancelled`) |
| `from_date` | string | Không | Lọc từ ngày (YYYY-MM-DD) |
| `to_date` | string | Không | Lọc đến ngày (YYYY-MM-DD) |

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "code": "IMP-2024001", // Mã phiếu (nếu có)
            "warehouse_id": 1,
            "warehouse_name": "Kho Tổng",
            "reason": "Nhập hàng từ nhà cung cấp ABC", // Ghi chú
            "status": "pending",
            "items_count": 5, // Tổng số lượng mặt hàng
            "total_quantity": 100, // Tổng số lượng sản phẩm
            "created_at": "...",
            "creator": { "id": 1, "name": "Admin" }
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "totalItems": 50,
        "totalPages": 5
    }
}
```

### 2.2. Chi tiết phiếu nhập
**GET** `/api/admin/warehouse-imports/:id`

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "code": "IMP-2024001",
        "warehouse_id": 1,
        "reason": "Nhập hàng",
        "status": "pending",
        "created_at": "...",
        "items": [
            {
                "product_id": 10,
                "product_name": "Áo Thun",
                "product_variant_id": 101, // Có thể null nếu sp đơn
                "variant_name": "Size M / Đen",
                "sku": "TSHIRT-M-BK",
                "quantity": 50,
                "current_stock": 10 // Tồn kho hiện tại (để tham khảo)
            }
        ]
    }
}
```

### 2.3. Tạo phiếu nhập (Draft)
**POST** `/api/admin/warehouse-imports`

**Body:**
```json
{
    "warehouse_id": 1,
    "reason": "Nhập hàng tháng 2",
    "items": [
        {
            "product_id": 10,
            "product_variant_id": 101,
            "quantity": 50
        },
        {
            "product_id": 10,
            "product_variant_id": 102,
            "quantity": 30
        }
    ]
}
```

### 2.4. Duyệt phiếu nhập (Approve)
**POST** `/api/admin/warehouse-imports/:id/approve`
*Hành động này sẽ **CỘNG (+)** tồn kho vào kho đích.*

### 2.5. Hủy phiếu nhập (Cancel)
**POST** `/api/admin/warehouse-imports/:id/cancel`
*Chỉ hủy được khi trạng thái là `pending`.*

---

## 3. Quản lý Xuất Kho (Warehouse Exports)
*Mục đích: Xuất hàng hủy, xuất sử dụng nội bộ, xuất trả nhà cung cấp (không phải bán hàng).*

### 3.1. Danh sách phiếu xuất
**GET** `/api/admin/warehouse-exports`

**Params:** Tương tự danh sách nhập.

### 3.2. Chi tiết phiếu xuất
**GET** `/api/admin/warehouse-exports/:id`

**Response:** Tương tự chi tiết nhập.

### 3.3. Tạo phiếu xuất (Draft)
**POST** `/api/admin/warehouse-exports`

**Body:**
```json
{
    "warehouse_id": 1,
    "reason": "Xuất hủy hàng hỏng",
    "items": [
        {
            "product_id": 10,
            "product_variant_id": 101,
            "quantity": 2
        }
    ]
}
```

### 3.4. Duyệt phiếu xuất (Approve)
**POST** `/api/admin/warehouse-exports/:id/approve`
*Hành động này sẽ **TRỪ (-)** tồn kho từ kho nguồn. Cần validate tồn kho >= số lượng xuất.*

### 3.5. Hủy phiếu xuất (Cancel)
**POST** `/api/admin/warehouse-exports/:id/cancel`
*Chỉ hủy được khi trạng thái là `pending`.*

---

## 4. Lưu ý Integration (FE)

1.  **Form Tạo Mới:**
    *   Tái sử dụng component chọn sản phẩm (`ProductVariantSearch`) giống màn hình Chuyển kho.
    *   **Nhập kho:** Cho phép nhập số lượng tùy ý (dương).
    *   **Xuất kho:** Nên hiển thị tồn kho hiện tại và validate không cho nhập quá tồn kho (Optional, BE sẽ chặn nhưng FE nên chặn trước).

2.  **Logic Update Tồn Kho:**
    *   FE **không cần** gọi API update tồn kho riêng lẻ.
    *   Chỉ cần gọi API `approve`, BE sẽ tự động tính toán.

3.  **Validation:**
    *   `warehouse_id`: Bắt buộc.
    *   `items`: Bắt buộc, không rỗng.
    *   `quantity`: Phải > 0.
