# Comic Admin API Documentation

**Base URL**: `/api/admin`
**Authentication**: Bearer Token required for all endpoints.
**Permission**: `comic.manage` is required.

## 1. Common Response Format

### Success Response
```json
{
    "data": { ... }, // Object or Array
    "meta": {       // Optional, for pagination
        "page": 1,
        "limit": 10,
        "total": 100,
        "total_pages": 10
    }
}
```

### Error Response
```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "error": "Bad Request"
}
```

---

## 2. Comic Categories (Danh mục truyện)

### 2.1 List Categories
**GET** `/comic-categories`
- **Query Params**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (search by name)
- **Response**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "Action",
            "slug": "action",
            "description": "Action comics",
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "total_pages": 1
    }
}
```

### 2.2 Get Category Details
**GET** `/comic-categories/:id`
- **Response**:
```json
{
    "id": 1,
    "name": "Action",
    "slug": "action",
    "description": "Action comics"
}
```

### 2.3 Create Category
**POST** `/comic-categories`
- **Body**:
```json
{
    "name": "Adventure",
    "slug": "adventure",   // Optional, auto-generated if empty
    "description": "Adventure comics"
}
```
- **Response**: Created Category object.

### 2.4 Update Category
**PUT** `/comic-categories/:id`
- **Body**: Same as Create (fields optional).
- **Response**: Updated Category object.

### 2.5 Delete Category
**DELETE** `/comic-categories/:id`
- **Response**: `true` or success message.

---

## 3. Comics (Truyện)

### 3.1 List Comics
**GET** `/comics`
- **Query Params**:
  - `page`: number
  - `limit`: number
  - `search`: string (title, author)
  - `category_id`: number
  - `status`: string (`draft`, `published`, `completed`, `hidden`)
- **Response**:
```json
{
    "data": [
        {
            "id": 1,
            "title": "One Piece",
            "slug": "one-piece",
            "cover_image": "https://example.com/cover.jpg",
            "author": "Oda",
            "status": "published",
            "is_featured": true,
            "view_count": 1000,
            "chapters_count": 1050,
            "categories": [
                { "id": 1, "name": "Action" }
            ],
            "created_at": "2024-01-01T00:00:00.000Z"
        }
    ],
    "meta": { ... }
}
```

### 3.2 Get Comic Details
**GET** `/comics/:id`
- **Response**:
```json
{
    "id": 1,
    "title": "One Piece",
    "slug": "one-piece",
    "description": "Pirate King...",
    "cover_image": "https://example.com/cover.jpg",
    "author": "Oda",
    "status": "published",
    "is_featured": true,
    "categories": [
        { "id": 1, "name": "Action" },
        { "id": 2, "name": "Adventure" }
    ],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
}
```

### 3.3 Create Comic
**POST** `/comics`
- **Body**:
```json
{
    "title": "Naruto",
    "slug": "naruto", // Optional
    "description": "Ninja story",
    "author": "Kishimoto",
    "status": "published",
    "category_ids": [1, 2],
    "is_featured": false
}
```
- **Response**: Created Comic object.

### 3.4 Update Comic
**PUT** `/comics/:id`
- **Body**: Same as Create (fields optional).
- **Response**: Updated Comic object.

### 3.5 Upload Cover Image
**POST** `/comics/:id/cover`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (binary)
- **Response**:
```json
{
    "id": 1,
    "cover_image": "https://storage.example.com/comics/1/cover.jpg",
    ...
}
```

### 3.6 Delete Comic
**DELETE** `/comics/:id`
- **Response**: Success message.

---

## 4. Chapters (Chương)

### 4.1 List Chapters
**GET** `/chapters`
- **Query Params**:
  - `page`: number
  - `limit`: number
  - `comic_id`: number (Required usually to filter by comic)
- **Response**:
```json
{
    "data": [
        {
            "id": 101,
            "comic_id": 1,
            "chapter_index": 1,
            "title": "Romance Dawn",
             "chapter_label": "Chapter 1",
            "status": "published",
            "view_count": 500,
            "created_at": "2024-01-01T00:00:00.000Z"
        }
    ],
    "meta": { ... }
}
```

### 4.2 Get Chapter Details
**GET** `/chapters/:id`
- **Response**:
```json
{
    "id": 101,
    "comic_id": 1,
    "chapter_index": 1,
    "title": "Romance Dawn",
    "pages": [
        {
            "id": 501,
            "page_number": 1,
            "image_url": "https://example.com/p1.jpg",
            "width": 800,
            "height": 1200
        },
        ...
    ]
}
```

### 4.3 Create Chapter
**POST** `/chapters`
- **Body**:
```json
{
    "comic_id": 1,
    "chapter_index": 1, // Order of chapter
    "title": "The Beginning",
    "chapter_label": "Chapter 1", // Optional display label
    "status": "published"
}
```
- **Response**: Created Chapter object.

### 4.4 Update Chapter
**PUT** `/chapters/:id`
- **Body**: Same as Create.
- **Response**: Updated Chapter.

### 4.5 Upload Chapter Pages
**POST** `/chapters/:id/pages`
- **Content-Type**: `multipart/form-data`
- **Body**: `files` (Multiple files allowed, up to 100)
- **Response**: Array of `ChapterPage` objects.

### 4.6 Update Pages (Reorder/Edit)
**PUT** `/chapters/:id/pages`
- **Body**:
```json
{
    "pages": [
        {
            "image_url": "https://new-url.com/p1.jpg",
            "width": 800,
            "height": 1200,
            "file_size": 1024
        }
        // Send full list in correct order. Previous pages will be replaced or updated.
    ]
}
```

### 4.7 Delete Chapter
**DELETE** `/chapters/:id`
- **Response**: Success message.

---

## 5. Reports & Statistics (Báo cáo & Thống kê)

### 5.1 Dashboard Overview
**GET** `/comic-stats/overview`
- **Description**: General statistics for the dashboard.
- **Response**:
```json
{
    "total_comics": 150,
    "total_chapters": 3200,
    "total_views": 1500000,
    "total_follows": 5000,
    "new_comics_today": 2,
    "new_chapters_today": 15
}
```

### 5.2 Top Viewed Comics
**GET** `/comic-stats/top-viewed`
- **Query Params**:
  - `period`: `all_time` | `month` | `week` (default: `all_time`)
  - `limit`: number (default: 10)
- **Response**:
```json
[
    {
        "id": 1,
        "title": "One Piece",
        "slug": "one-piece",
        "view_count": 500000,
        "diff_percent": 12.5 // Optional: Growth compare to last period
    },
    ...
]
```

### 5.3 Top Followed Comics
**GET** `/comic-stats/top-followed`
- **Query Params**:
  - `limit`: number (default: 10)
- **Response**:
```json
[
    {
        "id": 2,
        "title": "Attack on Titan",
        "slug": "aot",
        "follow_count": 3000
    },
    ...
]
```

### 5.4 Comic Trending (By Views Over Time)
**GET** `/comic-stats/trending`
- **Description**: Data for drawing charts (e.g. views last 7 days).
- **Query Params**:
  - `days`: number (default: 7)
- **Response**:
```json
[
    { "date": "2024-02-01", "views": 1200 },
    { "date": "2024-02-02", "views": 1500 },
    { "date": "2024-02-03", "views": 1100 },
    ...
]
```
