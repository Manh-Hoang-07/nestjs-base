import {
  Controller,
  Get,
} from '@nestjs/common';
import { PublicGeneralConfigService } from '../services/general-config.service';
import { Permission } from '@/common/auth/decorators';

@Controller('public/system-configs/general')
export class PublicGeneralConfigController {
  constructor(
    private readonly generalConfigService: PublicGeneralConfigService,
  ) {}

  /**
   * Lấy cấu hình chung (public, có cache)
   */
  @Permission('public')
  @Get()
  getConfig() {
    return this.generalConfigService.getConfig();
  }
}
