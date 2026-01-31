import { Controller, Get } from '@nestjs/common';
import { HomepageService } from '@/modules/comics/public/homepage/services/homepage.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('public/homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  /**
   * Lấy tất cả dữ liệu cần thiết cho trang chủ
   * Kết hợp 6 API calls thành 1 endpoint
   * Mỗi block được cache riêng với TTL khác nhau
   * 
   * Response bao gồm:
   * - comics (top_viewed, trending, popular, newest)
   * - chapters (latest)
   * - categories (comic_categories)
   * 
   * Lưu ý: API /users/me cần gọi riêng nếu cần thông tin user
   */
  @Permission('public')
  @Get()
  async getHomepage() {
    // Trả về data thuần, TransformInterceptor sẽ tự động wrap
    return await this.homepageService.getHomepageData();
  }
}

