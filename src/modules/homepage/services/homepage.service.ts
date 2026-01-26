import { Injectable } from '@nestjs/common';
import { CacheService } from '@/common/cache/services';
import { PublicProjectService } from '@/modules/introduction/project/public/services/project.service';
import { PublicAboutService } from '@/modules/introduction/about/public/services/about.service';
import { PublicStaffService } from '@/modules/introduction/staff/public/services/staff.service';
import { PublicPartnerService } from '@/modules/introduction/partner/public/services/partner.service';
import { PublicCertificateService } from '@/modules/introduction/certificate/public/services/certificate.service';
import { PublicFaqService } from '@/modules/introduction/faq/public/services/faq.service';

@Injectable()
export class HomepageService {
  // Cache keys cho từng block
  private readonly CACHE_KEYS = {
    PROJECTS: 'public:homepage:projects',
    ABOUT_SECTIONS: 'public:homepage:about_sections',
    STAFF: 'public:homepage:staff',
    PARTNERS: 'public:homepage:partners',
    CERTIFICATES: 'public:homepage:certificates',
    FAQS: 'public:homepage:faqs',
  };

  // Cache TTL theo từng block (giây)
  private readonly CACHE_TTL = {
    PROJECTS: 600,        // 10 phút - Dự án thay đổi không thường xuyên
    ABOUT_SECTIONS: 3600, // 1 giờ - Giới thiệu ít thay đổi
    STAFF: 1800,          // 30 phút - Nhân viên có thể thay đổi
    PARTNERS: 3600,       // 1 giờ - Đối tác ít thay đổi
    CERTIFICATES: 3600,   // 1 giờ - Chứng chỉ ít thay đổi
    FAQS: 1200,           // 20 phút - FAQs
  };

  constructor(
    private readonly cacheService: CacheService,
    private readonly projectService: PublicProjectService,
    private readonly aboutService: PublicAboutService,
    private readonly staffService: PublicStaffService,
    private readonly partnerService: PublicPartnerService,
    private readonly certificateService: PublicCertificateService,
    private readonly faqService: PublicFaqService,
  ) { }

  /**
   * Lấy tất cả dữ liệu cần thiết cho trang chủ
   * Mỗi block được cache riêng với TTL khác nhau
   * Fetch tất cả dữ liệu song song để tối ưu performance
   */
  async getHomepageData() {
    // Fetch tất cả dữ liệu song song với cache riêng cho từng block
    const [
      featuredProjects,
      aboutSections,
      staff,
      partners,
      certificates,
      popularFaqs,
    ] = await Promise.all([
      // Featured projects - cache 10 phút
      this.cacheService.getOrSet(
        this.CACHE_KEYS.PROJECTS,
        async () => {
          return await this.projectService.getFeatured(10);
        },
        this.CACHE_TTL.PROJECTS,
      ),

      // About sections - cache 1 giờ
      this.cacheService.getOrSet(
        this.CACHE_KEYS.ABOUT_SECTIONS,
        async () => {
          const result = await this.aboutService.getList({ limit: 20, page: 1 });
          return result?.data || [];
        },
        this.CACHE_TTL.ABOUT_SECTIONS,
      ),

      // Staff - cache 30 phút
      this.cacheService.getOrSet(
        this.CACHE_KEYS.STAFF,
        async () => {
          const result = await this.staffService.getList({ limit: 20, page: 1 });
          return result?.data || [];
        },
        this.CACHE_TTL.STAFF,
      ),

      // Partners - cache 1 giờ
      this.cacheService.getOrSet(
        this.CACHE_KEYS.PARTNERS,
        async () => {
          const result = await this.partnerService.getList({ limit: 20, page: 1 });
          return result?.data || [];
        },
        this.CACHE_TTL.PARTNERS,
      ),

      // Certificates - cache 1 giờ
      this.cacheService.getOrSet(
        this.CACHE_KEYS.CERTIFICATES,
        async () => {
          const result = await this.certificateService.getList({ limit: 20, page: 1 });
          return result?.data || [];
        },
        this.CACHE_TTL.CERTIFICATES,
      ),

      // Popular FAQs - cache 20 phút
      this.cacheService.getOrSet(
        this.CACHE_KEYS.FAQS,
        async () => {
          return await this.faqService.getPopular(10);
        },
        this.CACHE_TTL.FAQS,
      ),
    ]);

    return {
      // Dự án nổi bật
      featured_projects: featuredProjects,
      // Giới thiệu
      about_sections: aboutSections,
      // Nhân viên
      staff: staff,
      // Đối tác
      partners: partners,
      // Chứng chỉ
      certificates: certificates,
      // FAQs phổ biến
      popular_faqs: popularFaqs,
    };
  }

  /**
   * Xóa cache của một block cụ thể
   */
  async clearCacheBlock(block: keyof typeof this.CACHE_KEYS): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS[block]);
  }

  /**
   * Xóa toàn bộ cache của homepage
   */
  async clearAllCache(): Promise<void> {
    await Promise.all(
      Object.values(this.CACHE_KEYS).map((key) =>
        this.cacheService.del(key),
      ),
    );
  }

  /**
   * Xóa cache liên quan đến projects
   */
  async clearProjectsCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS.PROJECTS);
  }

  /**
   * Xóa cache liên quan đến about sections
   */
  async clearAboutCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS.ABOUT_SECTIONS);
  }

  /**
   * Xóa cache liên quan đến staff
   */
  async clearStaffCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS.STAFF);
  }

  /**
   * Xóa cache liên quan đến partners
   */
  async clearPartnersCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS.PARTNERS);
  }

  /**
   * Xóa cache liên quan đến certificates
   */
  async clearCertificatesCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS.CERTIFICATES);
  }

  /**
   * Xóa cache liên quan đến FAQs
   */
  async clearFaqsCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS.FAQS);
  }
}

