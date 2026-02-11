# Tài Liệu Giao Diện & Dữ Liệu: Sản Phẩm (Product)

Tài liệu này mô tả chi tiết giao diện (UI) và các luồng dữ liệu cần thiết cho tính năng Sản Phẩm, bao gồm trang Danh sách (Listing) và trang Chi tiết (Detail).

---

## 1. Dữ Liệu Sản Phẩm (Data Model)

Trước khi đi vào giao diện, cần hiểu cấu trúc dữ liệu trả về từ API để map vào UI.

### 1.1. Object Sản Phẩm (`Product`)
Các trường thông tin hiển thị trên UI:

| Trường dữ liệu | Kiểu | Mô tả Use Case UI |
| :--- | :--- | :--- |
| `id` | Number | Định danh duy nhất. |
| `name` | String | Tên sản phẩm, hiển thị 2 dòng, cắt bớt nếu quá dài. |
| `slug` | String | Tạo đường dẫn URL SEO (vd: `/products/ao-thun-basic`). |
| `price` | Number | **Giá gốc** (gạch ngang nếu có `sale_price`). |
| `sale_price` | Number | **Giá bán** (hiển thị nổi bật, màu đỏ/cam). |
| `image` | String | URL ảnh đại diện (thumbnail) trên lưới sản phẩm. |
| `gallery` | Array<String> | Danh sách URL ảnh chi tiết cho slide ảnh trang Detail. |
| `average_rating` | Number | Hiển thị số sao (0-5) dưới tên sản phẩm. |
| `review_count` | Number | Hiển thị số lượt đánh giá bên cạnh số sao (vd: `(45)`). |
| `is_new` | Boolean | Hiện badge "Mới" góc trên ảnh. |
| `is_featured` | Boolean | Hiện badge "Hot" hoặc "Nổi bật". |
| `is_digital` | Boolean | Dùng để hiển thị nhãn "Sản phẩm số" hoặc "Ebook" nếu cần. |
| `short_description` | String | Mô tả ngắn ngay dưới giá ở trang Detail. |
| `description` | HTML | Mô tả chi tiết, tab "Mô tả sản phẩm". |
| `stock_status` | Enum | `in_stock`, `out_of_stock`. Dùng disable nút mua. |

### 1.2. Biến Thể & Thuộc Tính (`Variant & Attributes`)
Dùng cho trang chi tiết:
- **Attributes**: Mảng các thuộc tính (vd: Màu, Size) để render các nút chọn.
- **Variants**: Mảng các cấu hình cụ thể (vd: Màu Đỏ + Size S -> ID 101, Giá 100k, Tồn 10).

---

## 2. Giao Diện Danh Sách Sản Phẩm (Product Listing UI)

Giao diện này thường xuất hiện ở trang `/products`, `/category/:slug` hoặc kết quả tìm kiếm.

### 2.1. Cấu Trúc Trang
Trang chia làm 2 cột: **Sidebar (Filter)** bên trái (25%) và **Main Content (Grid)** bên phải (75%).

#### A. Sidebar (Bộ Lọc)
Các thành phần từ trên xuống dưới:

1.  **Danh Mục (Categories)**
    *   Tiêu đề: "Danh Mục".
    *   UI: Danh sách cây thư mục (Tree view) hoặc List checkbox.
    *   Hành động: Click vào tên danh mục để lọc theo `category_slug`.
2.  **Khoảng Giá (Price Range)**
    *   Tiêu đề: "Lọc Theo Giá".
    *   UI: Slider 2 đầu hoặc 2 ô input (Min - Max).
    *   Nút "Áp dụng".
3.  **Đánh Giá (Rating)**
    *   Tiêu đề: "Đánh Giá".
    *   UI: List các dòng sao:
        *   [x] 5 sao (icon 5 sao vàng)
        *   [ ] 4 sao trở lên...
4.  **Thuộc Tính Khác (Dynamic Attributes)**
    *   Nếu đang ở danh mục "Thời trang": Hiện filter Màu sắc (Color swatches), Kích thước (Box text).

#### B. Main Content (Lưới Sản Phẩm)
1.  **Toolbar (Thanh công cụ trên cùng)**
    *   **Trái**: Hiển thị số lượng kết quả (vd: "Tìm thấy 20 sản phẩm cho 'Áo thun'").
    *   **Phải**: Dropdown "Sắp xếp theo":
        *   Mới nhất (`created_at:desc`)
        *   Bán chạy nhất (`sold:desc`)
        *   Giá thấp - cao (`price:asc`)
        *   Giá cao - thấp (`price:desc`)
    *   **View Toggle**: Nút chuyển đổi xem dạng Lưới (Grid) / Danh sách (List).

2.  **Product Grid (Lưới hiển thị)**
    *   Layout: Grid 4 cột (Desktop), 2 cột (Mobile).
    *   **Product Card (Thẻ sản phẩm)**:
        *   **Vùng Ảnh**:
            *   Ảnh tỉ lệ 1:1 hoặc 3:4.
            *   **Badges** (Góc trái trên): "Mới", "-20%".
            *   **Actions** (Hiện khi hover): Icon "Thêm giỏ hàng", "Xem nhanh", "Yêu thích".
        *   **Vùng Thông Tin**:
            *   Tên sản phẩm (Giới hạn 2 dòng).
            *   Rating: ⭐️⭐️⭐️⭐️⭐️ (12).
            *   Giá: **120.000đ** (Màu nổi) - ~~150.000đ~~ (Màu xám nhỏ).

3.  **Pagination (Phân trang)**
    *   Nằm dưới cùng.
    *   UI: [Prev] [1] **[2]** [3] ... [10] [Next].

---

## 3. Giao Diện Chi Tiết Sản Phẩm (Product Detail UI)

Trang hiển thị đầy đủ thông tin một sản phẩm (`/products/:slug`).

### 3.1. Khu Vực Thông Tin Chính (Top Section)
Chia 2 cột: **Gallery (Trái)** và **Info (Phải)**.

#### A. Gallery (Ảnh Sản Phẩm)
*   **Ảnh chính**: Kích thước lớn, hỗ trợ Zoom khi di chuột.
*   **Thumbnail list**: Carousel các ảnh nhỏ bên dưới/bên trái. Click thumbnail đổi ảnh chính.

#### B. Product Info (Thông Tin & Hành Động)
Thứ tự hiển thị từ trên xuống:
1.  **Breadcrumb**: Trang chủ > Danh mục > Tên sản phẩm.
2.  **Tiêu đề**: Tên sản phẩm (H1), Font lớn, đậm.
3.  **Meta data**:
    *   Rating: 5 sao (Show link "Xem 20 đánh giá").
    *   Mã SKU: "SKU: #12345".
    *   Tình trạng: "Còn hàng" (Xanh) hoặc "Hết hàng" (Đỏ).
4.  **Giá bán**:
    *   Giá Sale (Rất to, màu đỏ).
    *   Giá Gốc (Gạch ngang, màu xám).
    *   Badge tiết kiệm: "Tiết kiệm 20%".
5.  **Mô tả ngắn**: Đoạn text khoảng 2-3 dòng tóm tắt tính năng.
6.  **Bộ chọn biến thể (Variant Selector)** - *Quan trọng*:
    *   **Màu sắc**: Hiển thị dạng hình tròn (Color swatches). Click vào sẽ active và update ảnh chính tương ứng.
    *   **Kích thước**: Hiển thị dạng Button (S, M, L).
    *   *Logic*: Khi chọn, nếu combination hết hàng -> Button mờ đi hoặc gạch chéo.
7.  **Số lượng & Nút mua**:
    *   **Input số lượng**: Nút [-] [Input số] [+].
    *   **Nút "Thêm vào giỏ"**: Button lớn, Icon giỏ hàng, màu thương hiệu.
    *   **Nút "Mua ngay"**: Button lớn, màu khác biệt (vd: cam/đỏ).
    *   **Nút phụ**: Icon Yêu thích (Tim), Compare.
8.  **Thông tin thêm**: Policy (Giao hàng miễn phí, Đổi trả 30 ngày...).

### 3.2. Khu Vực Nội Dung Chi Tiết (Bottom Section)
Thường dùng Tabs hoặc các khối nội dung cuộn.

1.  **Tab "Mô tả chi tiết"**:
    *   Hiển thị nội dung HTML (`description`).
    *   Có hình ảnh minh họa, bài viết dài.
2.  **Tab "Thông số kỹ thuật"**:
    *   Bảng Table: Tên thuộc tính | Giá trị (vd: Chất liệu | Cotton).
3.  **Tab "Đánh giá & Nhận xét"**:
    *   **Tổng quan**: Điểm trung bình (4.5/5), Thanh bar tỉ lệ 5 sao, 4 sao...
    *   **Danh sách Review**: Avatar user, Tên, Số sao, Ngày đánh giá, Nội dung text, Ảnh đính kèm (nếu có).
    *   **Form viết đánh giá**: (Chỉ hiện nếu user đã đăng nhập & đã mua hàng - tuỳ logic).

### 3.3. Related Products (Sản Phẩm Liên Quan)
*   Tiêu đề: "Sản phẩm tương tự" hoặc "Có thể bạn sẽ thích".
*   UI: Carousel scroll ngang các Product Card (tương tự trang Listing).
