# Hướng dẫn Tích hợp logic Tồn kho mới (Dành cho Frontend)

## 1. Thay đổi cốt lõi (Core Architecture)
Hệ thống đã chuyển sang cơ chế quản lý kho tập trung. **Kho hàng (Warehouse)** hiện là nguồn dữ liệu duy nhất (Source of Truth) cho tất cả các con số tồn kho.

*   **Trường `stock_quantity` ở Biến thể sản phẩm:** Hiện tại là trường **Read-only** (Chỉ đọc). Backend sẽ tự động tính toán từ tổng các kho và cập nhật vào đây.
*   **Quản lý tồn kho:** Mọi thao tác thay đổi số lượng hàng (tăng/giảm) phải thông qua các phiếu **Nhập kho (Import)** hoặc **Xuất kho (Export)**.

---

## 2. Thay đổi UI trong Quản lý Sản phẩm
Khi tích hợp các form tạo/cập nhật Biến thể sản phẩm (`ProductVariant`):

*   **Trường Số lượng (Stock Quantity):** 
    *   Nên chuyển sang định dạng **Disabled** (không cho nhập) hoặc **Read-only**.
    *   Hiển thị kèm một ghi chú nhỏ: *"Số lượng được cập nhật tự động từ kho hàng"*.
    *   **Lưu ý:** Dù FE có gửi trường `stock_quantity` lên API cập nhật sản phẩm, Backend cũng sẽ bỏ qua (Ignore) để tránh sai lệch dữ liệu.

---

## 3. Quy trình điều chỉnh Tồn kho mới
Để thay đổi số lượng hàng, FE cần sử dụng các API thuộc module Warehouse:

### A. Nhập hàng mới
Sử dụng API **Warehouse Import** thay vì sửa trực tiếp trong sản phẩm.
*   **API:** `POST /api/admin/warehouses/import`
*   **Payload gợi ý:**
    ```json
    {
      "warehouse_id": 1,
      "items": [
        {
          "product_variant_id": 101,
          "quantity": 50
        }
      ],
      "notes": "Nhập hàng đợt 1"
    }
    ```

### B. Xuất hàng / Kiểm kê giảm
Sử dụng API **Warehouse Export**.
*   **API:** `POST /api/admin/warehouses/export`

---

## 4. Tự động đồng bộ (Automation)
Frontend không cần gọi thêm API để đồng bộ. Backend đã tự động xử lý trong các trường hợp:
1.  **Phê duyệt phiếu Nhập/Xuất:** Tự động cập nhật `stock_quantity` ở bản ghi Biến thể.
2.  **Đặt hàng thành công:** Trừ tồn ở cả Kho và Biến thể.
3.  **Hủy đơn hàng:** Hoàn tồn về cả Kho và Biến thể.

---

## 5. Kết luận
*   **Form Sản phẩm:** Chỉ dùng để sửa Tên, Giá, Ảnh, Thuộc tính.
*   **Form Kho hàng:** Dùng để quản lý Số lượng.

Vui lòng cập nhật các giao diện tương ứng để tránh người dùng nhầm lẫn khi không sửa được số lượng tại trang Sản phẩm.
