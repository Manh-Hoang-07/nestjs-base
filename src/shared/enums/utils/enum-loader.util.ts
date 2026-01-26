import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface cho enum metadata
 */
export interface EnumMetadata {
  name: string;
  key: string; // snake_case key để query
  enum: any;
  labels: Record<string, string>;
}

/**
 * Convention: Mỗi enum file phải export:
 * - {EnumName} (enum object từ Prisma)
 * - {EnumName}Labels (Record<EnumName, string>)
 * 
 * Ví dụ: basic-status.enum.ts
 * - Export: BasicStatus, BasicStatusLabels
 * - Key sẽ là: basic_status
 */
export class EnumLoader {
  private static enumCache: Map<string, EnumMetadata> | null = null;

  /**
   * Load tất cả enum files từ thư mục types/
   * Convention-based: tự động phát hiện dựa trên tên file và exports
   */
  static async loadAllEnums(): Promise<Map<string, EnumMetadata>> {
    if (this.enumCache) {
      return this.enumCache;
    }

    const enumMap = new Map<string, EnumMetadata>();
    const typesDir = path.join(__dirname, '../types');
    
    // Đọc tất cả file .enum.ts trong thư mục types
    const files = fs.readdirSync(typesDir).filter(
      file => file.endsWith('.enum.ts') && !file.includes('.d.ts')
    );

    for (const file of files) {
      try {
        const filePath = path.join(typesDir, file);
        // Dynamic import
        const module = await import(filePath);
        
        // Tìm enum và labels export
        // Convention: tên file basic-status.enum.ts -> BasicStatus, BasicStatusLabels
        const enumName = this.getEnumNameFromFile(file);
        const labelsName = `${enumName}Labels`;
        
        const enumValue = module[enumName];
        const labels = module[labelsName];

        if (enumValue && labels) {
          const key = this.getKeyFromFile(file);
          enumMap.set(key, {
            name: enumName,
            key,
            enum: enumValue,
            labels,
          });
        }
      } catch (error) {
        // Error loading enum - silently continue
      }
    }

    this.enumCache = enumMap;
    return enumMap;
  }

  /**
   * Convert file name to enum name
   * basic-status.enum.ts -> BasicStatus
   * user-status.enum.ts -> UserStatus
   */
  private static getEnumNameFromFile(fileName: string): string {
    const baseName = fileName.replace('.enum.ts', '');
    return baseName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Convert file name to key (snake_case)
   * basic-status.enum.ts -> basic_status
   * user-status.enum.ts -> user_status
   */
  private static getKeyFromFile(fileName: string): string {
    return fileName.replace('.enum.ts', '').replace(/-/g, '_');
  }

  /**
   * Get enum name từ key
   * basic_status -> BasicStatus
   */
  static getEnumNameFromKey(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Clear cache (useful for hot reload in development)
   */
  static clearCache(): void {
    this.enumCache = null;
  }
}

