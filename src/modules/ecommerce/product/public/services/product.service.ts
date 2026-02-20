import { Injectable, Inject, Logger } from '@nestjs/common';
import { Product } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../domain/product.repository';
import { CategoryCacheService } from '../../infrastructure/services/category-cache.service';

@Injectable()
export class PublicProductService extends BaseService<Product, IProductRepository> {
  private readonly logger = new Logger(PublicProductService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    protected readonly productRepository: IProductRepository,
    private readonly categoryCacheService: CategoryCacheService,
  ) {
    super(productRepository);
  }

  /**
   * Chuẩn bị filters cho public API
   */
  protected override async prepareFilters(
    filters?: any,
    _options?: any,
  ): Promise<any> {
    const prepared = { ...(filters || {}) };

    // Luôn chỉ lấy sản phẩm active
    prepared.status = 'active';

    // OPTIMIZED: Resolve category slug → ID using cache (eliminates JOIN!)
    if (prepared.category_slug) {
      const categoryId = await this.categoryCacheService.getCategoryIdBySlug(prepared.category_slug);

      if (categoryId) {
        // Use categoryId for direct filtering (1 JOIN instead of 2)
        prepared.categoryId = categoryId;
        delete prepared.category_slug;
      } else {
        // Fallback to slug-based query if not in cache
        prepared.categorySlug = prepared.category_slug;
        delete prepared.category_slug;
      }
    }

    // Xử lý price filters
    if (prepared.min_price !== undefined) {
      prepared.minPrice = prepared.min_price;
      delete prepared.min_price;
    }

    if (prepared.max_price !== undefined) {
      prepared.maxPrice = prepared.max_price;
      delete prepared.max_price;
    }

    return prepared;
  }

  /**
   * Transform product data
   * - Flatten categories structure
   * - Calculate price from variants
   */
  protected override transform(entity: any): any {
    if (!entity) return null;

    // Gọi transform của parent để xử lý BigInt và convert sang object an toàn
    const product = super.transform(entity) as any;
    if (!product) return null;

    // Flatten categories: categories[].category -> categories[]
    if (product.categories && Array.isArray(product.categories)) {
      product.categories = product.categories.map((c: any) => c.category);
    }

    // Calculate price from variants
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // 1. Lấy danh sách các mức giá (chuyển về Number để tính toán chính xác)
      const regularPrices = product.variants.map((v: any) => Number(v.price || 0));
      const effectivePrices = product.variants.map((v: any) => Number(v.sale_price || v.price || 0));
      const salePrices = product.variants
        .filter((v: any) => v.sale_price && Number(v.sale_price) > 0)
        .map((v: any) => Number(v.sale_price));

      // 2. Tính toán các giá trị biên
      const minRegularPrice = Math.min(...regularPrices);
      const maxRegularPrice = Math.max(...regularPrices);
      const minEffectivePrice = Math.min(...effectivePrices);
      const maxEffectivePrice = Math.max(...effectivePrices);

      // 3. Gán giá trị đồng nhất kiểu dữ liệu Number
      // price: Giá gốc thấp nhất (để hiển thị giá chưa giảm)
      product.price = minRegularPrice;

      // sale_price: Giá bán hiện tại thấp nhất (sau khi đã tính khuyến mãi)
      product.sale_price = salePrices.length > 0 ? Math.min(...salePrices) : null;

      // max_price: Giá bán hiện tại cao nhất (để hiển thị khoảng giá "Từ ... đến ...")
      // Chỉ set nếu có sự chênh lệch giữa giá thấp nhất và cao nhất
      product.max_price = maxEffectivePrice !== minEffectivePrice ? maxEffectivePrice : null;
    }

    return product;
  }

  /**
   * Lấy chi tiết sản phẩm theo slug
   */
  async getBySlug(slug: string): Promise<Product | null> {
    const product = await this.productRepository.findBySlug(slug);
    return this.transform(product);
  }

  async getProductVariants(productId: number | bigint): Promise<any> {
    return this.productRepository.findVariants(productId);
  }
}
