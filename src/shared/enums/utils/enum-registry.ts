/**
 * Enum Registry - TỰ ĐỘNG load tất cả enum files
 * 
 * Không cần đăng ký thủ công nữa!
 * Chỉ cần:
 * 1. Tạo file trong src/shared/enums/types/{name}.enum.ts
 * 2. Export {EnumName} và {EnumName}Labels
 * 3. Thêm export * vào index.ts
 * 
 * Registry sẽ tự động phát hiện và load!
 */

// Import tất cả enum files từ index.ts (barrel export)
import * as EnumTypes from '../index';

/**
 * Enum Registry Interface
 */
export interface EnumRegistryItem {
  name: string;
  key: string;
  enum: any;
  labels: Record<string, string>;
}

/**
 * Tự động build registry từ tất cả exports
 * Convention: 
 * - File: basic-status.enum.ts
 * - Export: BasicStatus, BasicStatusLabels
 * - Key: basic_status
 */
function buildEnumRegistry(): Record<string, EnumRegistryItem> {
  const registry: Record<string, EnumRegistryItem> = {};
  
  // Lấy tất cả exports từ EnumTypes
  const exports = Object.keys(EnumTypes);
  
  // Tìm tất cả enum và labels pairs
  // Pattern: {EnumName} và {EnumName}Labels
  const enumNames = new Set<string>();
  
  for (const exportName of exports) {
    // Nếu là Labels export (kết thúc bằng Labels)
    if (exportName.endsWith('Labels')) {
      const enumName = exportName.replace('Labels', '');
      if (exports.includes(enumName)) {
        enumNames.add(enumName);
      }
    }
  }
  
  // Build registry cho mỗi enum
  for (const enumName of enumNames) {
    const labelsName = `${enumName}Labels`;
    const enumValue = (EnumTypes as any)[enumName];
    const labels = (EnumTypes as any)[labelsName];
    
    if (enumValue && labels) {
      // Convert enum name to key (PascalCase -> snake_case)
      // BasicStatus -> basic_status
      const key = enumName
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '');
      
      registry[key] = {
        name: enumName,
        key,
        enum: enumValue,
        labels,
      };
    }
  }
  
  return registry;
}

/**
 * Registry của tất cả enums - TỰ ĐỘNG BUILD
 */
export const ENUM_REGISTRY: Record<string, EnumRegistryItem> = buildEnumRegistry();

/**
 * Helper function để thêm enum mới vào registry (optional, không cần thiết nữa)
 * @deprecated Không cần dùng nữa, registry tự động build
 */
export function registerEnum(
  key: string,
  name: string,
  enumValue: any,
  labels: Record<string, string>,
): void {
  ENUM_REGISTRY[key] = {
    name,
    key,
    enum: enumValue,
    labels,
  };
}
