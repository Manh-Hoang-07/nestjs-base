/**
 * Convert BigInt values to numbers in an object/array
 * This is a standalone utility for services that don't extend BaseService
 */
export function deepConvertBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    // Convert BigInt to Number
    if (typeof obj === 'bigint') return Number(obj);

    // If not object or array, return as is
    if (typeof obj !== 'object') return obj;

    // Handle Date: Return Date object so JSON.stringify handles it as ISO string
    if (Object.prototype.toString.call(obj) === '[object Date]') {
        return obj;
    }

    // Handle Array
    if (Array.isArray(obj)) {
        return obj.map((v) => deepConvertBigInt(v));
    }

    // Handle Object: Create clone and recursively convert properties
    // Only process plain objects ({}), leave class instances as is
    const isPlainObject = obj.constructor === undefined || obj.constructor.name === 'Object';
    if (!isPlainObject) {
        return obj;
    }

    const res: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            res[key] = deepConvertBigInt(obj[key]);
        }
    }
    return res;
}

/**
 * Alias for backward compatibility
 * @deprecated Use deepConvertBigInt instead
 */
export const toPlain = deepConvertBigInt;
