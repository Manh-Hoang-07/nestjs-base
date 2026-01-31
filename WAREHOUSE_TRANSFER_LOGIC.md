# Luồng Xử Lý Chuyển Kho (Warehouse Stock Transfer Workflow)

Tài liệu này mô tả chi tiết logic xử lý nghiệp vụ cho tính năng chuyển kho trong hệ thống Ecommerce.

## 1. Tổng Quan

Quy trình chuyển hàng giữa các kho trải qua các trạng thái chính:
`Pending` (Chờ duyệt) -> `Approved` (Đã duyệt) -> `Completed` (Hoàn tất)

Ngoài ra có thể bị `Cancelled` (Hủy) nếu chưa hoàn tất.

## 2. Chi Tiết Các Bước

### Bước 1: Tạo Phiếu Chuyển (Create)
**Trạng thái:** `Pending`

*   **Hành động:** Người dùng (Admin/Kho) tạo phiếu yêu cầu chuyển hàng từ **Kho A** sang **Kho B**.
*   **Logic kiểm tra:**
    *   Hệ thống kiểm tra tồn kho tại **Kho A** (nguồn) cho sản phẩm/biến thể (variant) được yêu cầu.
    *   Nếu tồn kho tại Kho A < số lượng chuyển -> **Báo lỗi** (Không đủ tồn kho).
*   **Kết quả:**
    *   Tạo bản ghi `StockTransfer` với trạng thái `pending`.
    *   **Chưa** trừ tồn kho thực tế ở Kho A (hoặc có thể giữ chỗ - tùy implementation, hiện tại code đang kiểm tra nhưng chưa trừ ngay tại bước này, hoặc logic trừ ngay để hold hàng tùy thuộc vào business cụ thể. *Theo code hiện tại: chỉ kiểm tra đủ hàng, chưa trừ*).

### Bước 2: Duyệt Phiếu (Approve)
**Trạng thái:** `Pending` -> `Approved`

*   **Hành động:** Quản lý kho duyệt phiếu chuyển.
*   **Logic xử lý (Code hiện tại):**
    1.  Kiểm tra lại xem phiếu có đang ở trạng thái `pending` không.
    2.  **Trừ tồn kho tại Kho A (Nguồn):**
        *   Tìm bản ghi kho (Inventory) của sản phẩm tại Kho A.
        *   Thực hiện trừ số lượng: `Tồn kho mới = Tồn kho cũ - Số lượng chuyển`.
*   **Kết quả:**
    *   Hàng hóa đã rời khỏi kho A (đã trừ tồn).
    *   Hàng hóa đang "trên đường đi" (chưa nhập vào kho B).
    *   Trạng thái phiếu chuyển thành `approved`.

### Bước 3: Hoàn Tất Nhập Kho (Complete)
**Trạng thái:** `Approved` -> `Completed`

*   **Hành động:** Kho B nhận được hàng và xác nhận nhập kho.
*   **Logic xử lý (Code hiện tại):**
    1.  Kiểm tra xem phiếu có đang ở trạng thái `approved` không.
    2.  **Cộng tồn kho tại Kho B (Đích):**
        *   Hệ thống tìm bản ghi kho (Inventory) của sản phẩm tại Kho B.
        *   **Trường hợp 1: Kho B ĐÃ CÓ sản phẩm này (đã từng nhập/bán):**
            *   Cập nhật số lượng: `Tồn kho mới = Tồn kho cũ + Số lượng chuyển`.
        *   **Trường hợp 2: Kho B CHƯA CÓ sản phẩm này (sản phẩm mới với kho này):**
            *   Hệ thống sẽ **tự động tạo mới** một bản ghi Inventory cho sản phẩm/biến thể đó tại Kho B.
            *   Số lượng khởi tạo = Số lượng chuyển.
            *   `min_quantity` (cảnh báo tồn thấp) mặc định là 0.
*   **Kết quả:**
    *   Hàng hóa chính thức thuộc về Kho B.
    *   Trạng thái phiếu chuyển thành `completed`.

### Bước 4: Hủy Phiếu (Cancel)
**Trạng thái:** `Pending` hoặc `Approved` -> `Cancelled`

*   **Hành động:** Hủy phiếu chuyển do sai sót hoặc không cần thiết nữa.
*   **Logic xử lý:**
    *   Nếu hủy khi đang `pending`: Chỉ đơn giản cập nhật trạng thái thành `cancelled` (vì chưa trừ kho).
    *   Nếu hủy khi đang `approved` (đã trừ kho A nhưng chưa nhập kho B):
        *   **Hoàn lại kho A:** Cộng lại số lượng đã trừ vào tồn kho của Kho A.
        *   Cập nhật trạng thái thành `cancelled`.

## 3. Tóm Tắt Kỹ Thuật (Theo Code Implement)

*   **File xử lý chính:** `src/modules/ecommerce/warehouse/admin/services/warehouse.service.ts`
*   **Repository:** Sử dụng `inventoryRepository` để `findOne`, `create`, `update` tồn kho.

| Hành động | Thay đổi kho Nguồn (A) | Thay đổi kho Đích (B) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Tạo (Create)** | Không đổi (chỉ check đủ) | Không đổi | |
| **Duyệt (Approve)** | **Giảm (-) Số lượng** | Không đổi | Hàng đang đi đường |
| **Hủy (Cancel)** | **Cộng (+) Lại** (nếu đã duyệt) | Không đổi | Hoàn tác |
| **Hoàn tất (Complete)**| Không đổi | **Tăng (+) Số lượng** | **Tự tạo mới record nếu chưa có** |
