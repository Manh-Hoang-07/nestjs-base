import { Injectable } from '@nestjs/common';
import { ENUM_REGISTRY } from '../utils/enum-registry';

@Injectable()
export class EnumService {
  // Cấu hình cho từng loại enum - TỰ ĐỘNG load từ registry
  // Không cần import thủ công, chỉ cần tạo file enum mới!
  private readonly enumConfigs: Record<string, any>;

  constructor() {
    // Tự động load từ registry (registry tự động build từ tất cả enum files)
    this.enumConfigs = {};
    for (const [key, item] of Object.entries(ENUM_REGISTRY)) {
      this.enumConfigs[key] = {
        enum: item.enum,
        labels: item.labels,
      };
    }
  }

  /**
   * Lấy tất cả enums với value và label
   */
  getAllEnums() {
    const result: Record<string, { value: string; label: string }[]> = {};
    for (const [key, config] of Object.entries(this.enumConfigs)) {
      result[key] = this.buildEnumValues(config);
    }
    return result;
  }

  /**
   * Lấy enum theo tên với value và label
   */
  getEnumByName(name: string): { name: string; values: { value: string; label: string }[] } | null {
    const config = this.enumConfigs[name.toLowerCase()];
    if (!config) return null;

    return {
      name: this.getEnumName(name),
      values: this.buildEnumValues(config)
    };
  }

  /**
   * Xây dựng giá trị enum chỉ với value và label
   */
  private buildEnumValues(config: any): { value: string; label: string }[] {
    return Object.values(config.enum).map((value: string | number) => {
      const stringValue = String(value);
      return {
        id: stringValue,
        value: stringValue,
        name: config.labels?.[value as keyof typeof config.labels] || stringValue,
        label: config.labels?.[value as keyof typeof config.labels] || stringValue
      };
    });
  }

  /**
   * Lấy tên enum từ key
   * Tự động lấy từ registry
   */
  private getEnumName(key: string): string {
    const item = ENUM_REGISTRY[key];
    return item?.name || key;
  }

  /**
   * Danh sách các enum key đang được hỗ trợ
   */
  getAvailableEnumKeys(): string[] {
    return Object.keys(this.enumConfigs);
  }
}
