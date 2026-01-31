# Hướng dẫn tích hợp Chuyển kho (Warehouse Transfer)

## 1. Tổng quan
Tính năng chuyển kho cho phép điều chuyển hàng hóa (Product Variant) từ kho này sang kho khác.
Quy trình: `Pending` (Tạo phiếu) -> `Approved` (Duyệt phiếu - trừ kho nguồn) -> `Completed` (Hoàn tất - cộng kho đích) hoặc `Cancelled`.

## 2. Menu và Quyền hạn
- **Menu**: Đã được thêm vào seeding.
  - Path: `/admin/warehouse-transfers`
  - Parent: `Ecommerce` (sau Kho hàng)
  - Permission required: `warehouse_transfer.manage`
- **Quyền hạn**:
  - `warehouse_transfer.manage`: Quyền quản lý chung (xem, tạo, duyệt).

## 3. Quy trình chi tiết
1.  **Tạo phiếu chuyển (Pending)**:
    -   Nhân viên hoặc quản lý tạo phiếu chuyển kho.
    -   Chọn kho nguồn, kho đích, sản phẩm (variant), số lượng.
    -   Hệ thống kiểm tra tồn kho nguồn (nếu có logic chặt chẽ).
    -   Trạng thái ban đầu: `Pending`.

2.  **Duyệt phiếu (Approve)**:
    -   Quản lý kho duyệt phiếu.
    -   **Hành động**: Trừ số lượng tồn kho tại **Kho nguồn**.
    -   Trạng thái chuyển sang: `Approved`.
    -   Hàng đang trên đường đi (In Transit).

3.  **Hoàn tất (Complete)**:
    -   Kho đích nhận hàng và xác nhận.
    -   **Hành động**: Cộng số lượng tồn kho tại **Kho đích**.
    -   Trạng thái chuyển sang: `Completed`.

4.  **Hủy phiếu (Cancel)**:
    -   Nếu phiếu đang ở trạng thái `Pending`, hủy phiếu không ảnh hưởng tồn kho.
    -   Nếu phiếu đã `Approved` (đã trừ kho nguồn), khi hủy cần hoàn lại kho nguồn (logic hoàn kho đã được tích hợp cơ bản).
    -   Trạng thái chuyển sang: `Cancelled`.

## 4. API Endpoints

### 4.1. Danh sách phiếu chuyển
- **URL**: `GET /api/admin/warehouses/transfers/list`
- **Query Params**:
  - `page`: Số trang (default 1)
  - `limit`: Số lượng bản ghi (default 10)
  - `status`: Lọc theo trạng thái (`pending`, `approved`, `completed`, `cancelled`)
  - `warehouse_id`: Lọc theo kho (nguồn hoặc đích - logic hiện tại có thể cần điều chỉnh để filter rõ ràng from/to)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "from_warehouse_id": 1,
        "to_warehouse_id": 2,
        "product_variant_id": 105,
        "quantity": 50,
        "status": "pending",
        "notes": "Chuyển gấp",
        "created_at": "...",
        ...
      }
    ],
    "total": 1
  }
  ```

### 4.2. Tạo phiếu chuyển
- **URL**: `POST /api/admin/warehouses/transfers`
- **Body**:
  ```json
  {
    "from_warehouse_id": 1,
    "to_warehouse_id": 2,
    "product_variant_id": 105,
    "quantity": 10,
    "notes": "Ghi chú nếu có"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    ...
  }
  ```

### 4.3. Duyệt phiếu (Approve)
- **URL**: `PUT /api/admin/warehouses/transfers/:id/approve`
- **Body**: `{}` (Empty)
- **Response**: `Success`

### 4.4. Hoàn tất phiếu (Complete)
- **URL**: `PUT /api/admin/warehouses/transfers/:id/complete`
- **Body**: `{}` (Empty)
- **Response**: `Success`

### 4.5. Hủy phiếu (Cancel)
- **URL**: `PUT /api/admin/warehouses/transfers/:id/cancel`
- **Body**: `{}` (Empty)
- **Response**: `Success`

## 5. Lưu ý cho Frontend
- Cần hiển thị rõ tên Kho nguồn và Kho đích.
- Khi tạo phiếu, nên dùng dropdown chọn sản phẩm/variant có `search` để tìm kiếm dễ dàng.
- Hiển thị lịch sử trạng thái hoặc Audit log nếu cần thiết (hiện tại backend chỉ lưu `updated_user_id`).
