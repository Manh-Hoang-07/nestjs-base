import { Controller, Get } from '@nestjs/common';
import { HomepageService } from '@/modules/homepage/services/homepage.service';
import { Permission } from '@/common/auth/decorators';

@Controller('public/homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  /**
   * Lấy tất cả dữ liệu cần thiết cho trang chủ
   * Kết hợp nhiều API calls thành 1 endpoint
   * Mỗi block được cache riêng với TTL khác nhau
   * 
   * Response bao gồm:
   * - featured_projects: Dự án nổi bật
   * - about_sections: Các phần giới thiệu
   * - staff: Nhân viên
   * - featured_testimonials: Lời chứng thực nổi bật
   * - partners: Đối tác
   * - featured_gallery: Gallery nổi bật
   * - certificates: Chứng chỉ
   * - popular_faqs: FAQs phổ biến
   */
  @Permission('public')
  @Get()
  async getHomepage() {
    // Trả về data thuần, TransformInterceptor sẽ tự động wrap
    return await this.homepageService.getHomepageData();
  }
}

