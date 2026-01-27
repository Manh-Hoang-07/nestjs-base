## Tích hợp API Public: Phương thức vận chuyển & Danh mục sản phẩm

- **Mục tiêu**
  - Cho phép FE website/FE checkout lấy danh sách phương thức vận chuyển, tính phí ship.
  - Cho phép FE hiển thị cây danh mục sản phẩm, lấy sản phẩm theo danh mục, slug, phân trang.

> **Base prefix chung**: tất cả endpoint dưới đây giả định được mount dưới prefix `api`, ví dụ: `https://your-domain.com/api/public/...`

---

## 1. API Public phương thức vận chuyển (`public/shipping-methods`)

- **Base URL**
  - `GET /api/public/shipping-methods`
  - `GET /api/public/shipping-methods/active`
  - `GET /api/public/shipping-methods/:id`
  - `POST /api/public/shipping-methods/calculate`

> Từ controller `PublicShippingMethodController` (`@Controller('public/shipping-methods')`).

### 1.1. Lấy danh sách phương thức vận chuyển

- **Endpoint**
  - `GET /api/public/shipping-methods`
- **Query params**
  - Hỗ trợ chuẩn `prepareQuery` giống các list khác:
  - **Phổ biến:**
    - `page`: number, optional, default 1.
    - `limit`: number, optional, default 20 (hoặc như config chung).
    - `search`: string, optional (tìm theo name/code).
    - `status`: string, optional (`active` / `inactive` nếu BE map sang `BasicStatus`).
    - `sort`: string, optional, dạng `field:direction`, ví dụ: `name:ASC`.
- **Response (gợi ý dạng chuẩn list)**
  - `200 OK`
  - Body:
    - `items`: array các shipping methods (id, name, code, status, price rules…).
    - `meta`: object, gồm `page`, `limit`, `total`, `totalPages`.
- **Use-case FE**
  - Màn hình checkout/public:
    - Nếu muốn cho user chọn cả phương thức đang inactive (cho A/B test, ẩn FE) thì có thể gọi list full, sau đó FE tự filter theo rule riêng.
  - Trang public hiển thị danh sách phương thức giao hàng.

### 1.2. Lấy danh sách phương thức vận chuyển đang active

- **Endpoint**
  - `GET /api/public/shipping-methods/active`
- **Query params**
  - Không có query đặc biệt (chỉ lấy theo `status = active` từ service `findActive()`).
- **Response**
  - `200 OK`
  - Body: array các shipping methods đang active.
- **Use-case FE**
  - Tại bước checkout:
    - FE thường chỉ gọi endpoint này để hiển thị danh sách shipping cho khách chọn.
    - Tránh hiển thị những phương thức đã tắt ở Admin.

### 1.3. Lấy chi tiết 1 phương thức vận chuyển

- **Endpoint**
  - `GET /api/public/shipping-methods/:id`
- **Params**
  - `id`: number (ParseIntPipe).
- **Response**
  - `200 OK`
  - Body: object shipping method (thông tin cấu hình, điều kiện áp dụng, v.v.).
- **Use-case FE**
  - Khi cần load chi tiết 1 phương thức (ví dụ: popup giải thích điều kiện, thời gian giao dự kiến).

### 1.4. Tính phí vận chuyển cho giỏ hàng

- **Endpoint**
  - `POST /api/public/shipping-methods/calculate`
- **Body (DTO `CalculateShippingDto`)**
  - `shipping_method_id`: number, **bắt buộc**
  - `cart_value`: number, **bắt buộc** – tổng giá trị đơn (sau giảm giá).
  - `weight`: number, optional – tổng khối lượng (nếu hệ thống tính phí theo cân nặng).
  - `destination`: string, optional – thông tin đích (tỉnh/thành/quận/huyện/zipcode,...; tuỳ BE đang parse).
- **Response**
  - `200 OK`
  - Body (gợi ý):
    - `shipping_method_id`: number.
    - `cost`: number – phí ship đã tính.
    - Có thể kèm thêm: `estimated_delivery_time`, `notes`, v.v. (check ở service `calculateShippingCost` thực tế).
- **Use-case FE**
  - Khi user:
    - Chọn phương thức vận chuyển.
    - Thay đổi địa chỉ nhận hàng.
    - Thay đổi giỏ hàng (tổng tiền, trọng lượng).
  - FE gọi endpoint này để cập nhật phí ship trong checkout summary.

---

## 2. API Public danh mục sản phẩm (`public/product-categories`)

- **Base URL**
  - `GET /api/public/product-categories`
  - `GET /api/public/product-categories/tree`
  - `GET /api/public/product-categories/root`
  - `GET /api/public/product-categories/:id/products`
  - `GET /api/public/product-categories/:slug`

> Từ controller `PublicProductCategoryController` (`@Controller('public/product-categories')`).

### 2.1. Lấy danh sách danh mục (tree/flat)

- **Endpoint**
  - `GET /api/public/product-categories`
- **Query params** (DTO `GetCategoriesDto` qua `prepareQuery`)
  - `page`: number, optional, default `1`, `Min(1)`.
  - `limit`: number, optional, default `50`, `Min(1)`, `Max(100)`.
  - `search`: string, optional – tìm theo tên.
  - `status`: `'active' | 'inactive'`, optional (BE map sang enum `BasicStatus`).
  - `parent_id`: string, optional – filter theo parent cụ thể (tuỳ cách BE xử lý).
  - `format`: `'tree' | 'flat'`, optional, default `'tree'`.
  - `sort_by`: `'name' | 'sort_order | 'created_at'`, optional, default `'sort_order'`.
  - `sort_order`: `'ASC' | 'DESC'`, optional, default `'ASC'`.
- **Hành vi từ service `getCategories`**
  - Nếu `format = 'flat'`:
    - Trả về list phẳng (`items`, `meta`) dựa trên `getList` (filter theo `status`, paging, sort).
  - Nếu `format = 'tree'` (mặc định):
    - Lấy `tree` từ repository, tự làm pagination trên mảng gốc.
    - Kết quả vẫn dạng `items` + `meta` nhưng `items` là các node root, mỗi node có `children`.
- **Response (gợi ý)**
  - `200 OK`
  - Body:
    - `items`: array category (tree hoặc flat tuỳ `format`).
    - `meta`: paging.
- **Use-case FE**
  - Menu category bên trái / mega menu:
    - Gọi `GET /api/public/product-categories?format=tree&status=active`.
  - Trang quản lý filter: có thể dùng dạng `flat` để load toàn bộ list cho dropdown.

### 2.2. Lấy cây danh mục (`/tree`)

- **Endpoint**
  - `GET /api/public/product-categories/tree`
- **Query params**
  - Giống `GetCategoriesDto`, nhưng controller luôn set `format = 'tree'`.
  - Có thể truyền `page`, `limit`, `status`, `sort_by`, `sort_order`.
- **Response**
  - `200 OK`
  - Body: cây danh mục phân trang theo root (mỗi root có `children` lồng nhau).
- **Use-case FE**
  - Nav/menu, sidebar category, mega menu:
    - Gọi thẳng endpoint này để luôn nhận cấu trúc tree.

### 2.3. Lấy danh mục root (`/root`)

- **Endpoint**
  - `GET /api/public/product-categories/root`
- **Query params**
  - Giống `/tree` (controller set `format = 'tree'`).
  - BE có thể chỉ trả về các categories root (tuỳ implementation trong repository).
- **Response**
  - `200 OK`
  - Body: danh sách root categories (kèm children nếu có).
- **Use-case FE**
  - Trang chủ:
    - Hiển thị một vài danh mục chính (root) + hình ảnh -> gợi ý FE: gọi `/root?limit=6`.

### 2.4. Lấy danh sách sản phẩm theo `category_id`

- **Endpoint**
  - `GET /api/public/product-categories/:id/products`
- **Params**
  - `id`: number, ParseIntPipe.
- **Query params**
  - `page`: number, default `1`.
  - `limit`: number, default `10`.
  - (Các query filter khác nếu BE có xử lý thêm trong `getCategoryProducts` – kiểm tra thêm ở service nếu cần chi tiết).
- **Response**
  - `200 OK`
  - Body:
    - `items`: array sản phẩm thuộc category.
    - `meta`: paging.
- **Use-case FE**
  - Trang category theo id (nội bộ):
    - Khi chuyển trang/paginate, FE chỉ thay `page`, `limit`.

### 2.5. Lấy chi tiết danh mục theo `slug`

- **Endpoint**
  - `GET /api/public/product-categories/:slug`
- **Params**
  - `slug`: string.
- **Query params** (DTO `GetCategoryDto`)
  - `include`: string, optional – gợi ý dùng để khai báo muốn include thêm quan hệ (tuỳ BE).
  - `include_products`: string, optional – ví dụ: `'true'` để BE trả thêm `products` của category.
  - `include_children`: string, optional – ví dụ: `'true'` để BE trả thêm `children`.
- **Response**
  - `200 OK`
  - Body: object category:
    - Thông tin cơ bản: id, name, slug, description, image, v.v.
    - Tuỳ theo `include_*` mà có thêm `products`, `children`, hoặc các quan hệ khác.
- **Use-case FE**
  - Trang SEO `/category/:slug`:
    - Khi user vào URL, FE gọi endpoint này để:
      - Lấy thông tin category (SEO title, description, image).
      - Optionally load luôn `products` & `children` nếu BE support thông qua `include_products`, `include_children`.

---

## 3. Gợi ý luồng tích hợp FE

- **Checkout / Cart**
  - Bước chọn shipping:
    - 1) Gọi `GET /api/public/shipping-methods/active` để render danh sách radio/option.
    - 2) Khi user chọn method + nhập địa chỉ:
      - Gọi `POST /api/public/shipping-methods/calculate` với `shipping_method_id`, `cart_value`, `weight`, `destination`.
      - Cập nhật tổng tiền (subtotal + shipping - discount).

- **Menu danh mục & trang category**
  - Menu:
    - Gọi `GET /api/public/product-categories/tree?status=active` để dựng tree full.
  - Trang `/category/:slug`:
    - Gọi `GET /api/public/product-categories/:slug?include_products=true&include_children=true` (nếu BE hỗ trợ logic include).
    - Hoặc:
      - Bước 1: lấy category theo slug (chi tiết).
      - Bước 2: gọi `GET /api/public/product-categories/:id/products?page=1&limit=20` với `id` lấy được.

- **SEO & Landing**
  - Dùng tree/root categories để build các block:
    - “Danh mục nổi bật”, “Khám phá theo ngành hàng”, v.v.


