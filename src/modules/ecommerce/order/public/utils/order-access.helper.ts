import * as crypto from 'crypto';

/**
 * Generate access key for order tracking
 * Key được tạo từ các thông tin của đơn hàng (tương tự PHP hash function)
 */
export function generateOrderAccessKey(order: any, keys: string[] = ['id', 'order_number', 'customer_email', 'customer_phone', 'total_amount']): string {
  if (!order || !keys || keys.length === 0) {
    return '';
  }

  const hashValues: string[] = [];
  
  for (const key of keys) {
    const fields = key.split('.');
    let value: any = order;
    
    for (const field of fields) {
      value = value?.[field] ?? '';
    }
    
    const hashValue = Array.isArray(value) || typeof value === 'object' 
      ? JSON.stringify(value) 
      : String(value || '');
    
    hashValues.push(hashValue);
  }

  return crypto.createHash('sha256').update(hashValues.join('_')).digest('hex');
}

/**
 * Verify access key for order
 */
export function verifyOrderAccessKey(
  order: any,
  accessKey: string,
  keys: string[] = ['id', 'order_number', 'customer_email', 'customer_phone', 'total_amount'],
): boolean {
  const expectedKey = generateOrderAccessKey(order, keys);
  return expectedKey === accessKey;
}

