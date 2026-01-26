import { Injectable, Inject } from '@nestjs/common';
import { IGeneralConfigRepository, GENERAL_CONFIG_REPOSITORY } from '@/modules/core/system-config/system-config/domain/general-config.repository';
import { CacheService } from '@/common/cache/services';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PublicGeneralConfigService extends BaseService<any, IGeneralConfigRepository> {
  private readonly CACHE_KEY = 'public:general-config';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @Inject(GENERAL_CONFIG_REPOSITORY)
    private readonly generalConfigRepo: IGeneralConfigRepository,
    private readonly cacheService: CacheService,
  ) {
    super(generalConfigRepo);
  }

  /**
   * Lấy cấu hình chung (có cache)
   * Dùng cho public API
   */
  async getConfig(): Promise<any> {
    return this.cacheService.getOrSet<any>(
      this.CACHE_KEY,
      async () => {
        const config = await this.generalConfigRepo.getConfig();
        return this.transform(config);
      },
      this.CACHE_TTL,
    );
  }

  /**
   * Xóa cache (được gọi khi admin update config)
   */
  async clearCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEY);
  }

  protected transform(config: any) {
    if (!config) return config;
    const item = super.transform(config) as any;

    // Ensure contact_channels is an array
    if (item.contact_channels) {
      if (typeof item.contact_channels === 'string') {
        try {
          item.contact_channels = JSON.parse(item.contact_channels);
        } catch (e) {
          item.contact_channels = [];
        }
      }
      if (!Array.isArray(item.contact_channels)) {
        item.contact_channels = [];
      }
    } else {
      item.contact_channels = [];
    }

    return item;
  }
}
