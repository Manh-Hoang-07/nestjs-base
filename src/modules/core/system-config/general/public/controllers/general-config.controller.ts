import {
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { PublicGeneralConfigService } from '../services/general-config.service';
import { Permission } from '@/common/auth/decorators';
import { CacheInterceptor, Cacheable } from '@/common/cache';

@Controller('public/system-configs/general')
@UseInterceptors(CacheInterceptor)
export class PublicGeneralConfigController {
  constructor(
    private readonly generalConfigService: PublicGeneralConfigService,
  ) { }

  /**
   * Lấy cấu hình chung (public, có cache)
   */
  @Permission('public')
  @Cacheable({ key: 'system:configs:general', ttl: 86400 }) // Cache for 24 hours
  @Get()
  getConfig() {
    return this.generalConfigService.getConfig();
  }
}
