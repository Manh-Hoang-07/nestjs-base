import * as crypto from 'crypto';

/**
 * SECRET SALT - Để đảm bảo hash không thể bị đoán ngược từ order_number
 */
const HASH_SALT = 'nestjs_ecommerce_secure_salt_2026';

/**
 * Generate access key for order tracking
 * Dùng bộ khóa tối giản nhất để TRÁNH SAI LỆCH định dạng dữ liệu
 */
export function generateOrderAccessKey(order: any): string {
  if (!order) return '';

  // Chỉ dùng 2 trường LUÔN LUÔN là string để đảm bảo tính nhất quán tuyệt đối
  const orderNumber = String(order.order_number || '').trim();
  const customerEmail = String(order.customer_email || '').trim().toLowerCase();

  // Kết hợp với Salt để bảo mật
  const rawString = `${orderNumber}|${customerEmail}|${HASH_SALT}`;

  return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * Verify access key for order
 */
export function verifyOrderAccessKey(order: any, accessKey: string): boolean {
  if (!accessKey || !order) return false;

  const expectedKey = generateOrderAccessKey(order);
  return expectedKey === accessKey;
}
