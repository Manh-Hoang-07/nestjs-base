/**
 * Utility functions for handling file paths
 */

/**
 * Thêm domain vào đường dẫn file nếu chưa có
 * @param path - Đường dẫn file (ví dụ: /uploads/banners/home-slider-3.jpg)
 * @param baseUrl - Base URL của project (ví dụ: https://example.com)
 * @returns URL đầy đủ hoặc path gốc nếu không cần thêm domain
 */
export function addDomainToPath(path: string | null | undefined, baseUrl: string): string | null | undefined {
  if (!path || !baseUrl) {
    return path;
  }

  // Nếu path đã là URL đầy đủ (bắt đầu bằng http:// hoặc https://), trả về nguyên bản
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Nếu path bắt đầu bằng /uploads hoặc /storage, thêm domain vào
  if (path.startsWith('/uploads') || path.startsWith('/storage')) {
    // Đảm bảo baseUrl không có trailing slash
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Đảm bảo path bắt đầu bằng /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBaseUrl}${cleanPath}`;
  }

  // Trả về path gốc nếu không phải đường dẫn file upload
  return path;
}

/**
 * Transform object recursively để thêm domain vào tất cả các file paths
 * @param obj - Object hoặc array cần transform
 * @param baseUrl - Base URL của project
 * @param pathFields - Danh sách các field names có thể chứa file paths (mặc định: ['image', 'mobile_image', 'avatar', 'photo', 'url', 'path'])
 * @returns Object đã được transform
 */
export function transformFilePaths(
  obj: any,
  baseUrl: string,
  pathFields: string[] = ['image', 'mobile_image', 'avatar', 'photo', 'url', 'path', 'thumbnail', 'cover', 'logo', 'icon']
): any {
  if (!obj || !baseUrl) {
    return obj;
  }

  // Nếu là string, kiểm tra xem có phải là path không
  if (typeof obj === 'string') {
    // Nếu string bắt đầu bằng /uploads hoặc /storage, thêm domain
    if (obj.startsWith('/uploads') || obj.startsWith('/storage')) {
      return addDomainToPath(obj, baseUrl);
    }
    return obj;
  }

  // Nếu là array, transform từng phần tử
  if (Array.isArray(obj)) {
    return obj.map(item => transformFilePaths(item, baseUrl, pathFields));
  }

  // Nếu không phải object hoặc là null thì giữ nguyên
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // Nếu là Date hoặc các class đặc biệt (ví dụ Prisma Decimal), giữ nguyên để tránh biến thành {}
  if (Object.prototype.toString.call(obj) === '[object Date]' || (obj.constructor && obj.constructor.name !== 'Object')) {
    return obj;
  }

  // Nếu là object, transform từng property
  const transformed: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // Check if this field is a known path field
    if (pathFields.includes(key)) {
      if (typeof value === 'string') {
        // Check if it's a JSON string
        const trimmed = value.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(value);
            transformed[key] = transformFilePaths(parsed, baseUrl, pathFields);
            continue;
          } catch (e) {
            // Not valid JSON, treat as regular path string
          }
        }
        // Regular string path
        transformed[key] = addDomainToPath(value, baseUrl);
      } else if (typeof value === 'object' && value !== null) {
        // Flatten/Recursively transform nested objects/arrays (e.g. images array)
        transformed[key] = transformFilePaths(value, baseUrl, pathFields);
      } else {
        transformed[key] = value;
      }
    } else {
      // Not a path field, but assume if it looks like a path we process it
      if (typeof value === 'string' && (value.startsWith('/uploads') || value.startsWith('/storage'))) {
        transformed[key] = addDomainToPath(value, baseUrl);
      } else {
        // Recursively transform nested objects/arrays
        transformed[key] = transformFilePaths(value, baseUrl, pathFields);
      }
    }
  }

  return transformed;
}

