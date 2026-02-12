import { Injectable, Inject, Logger } from '@nestjs/common';
import { Product } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../domain/product.repository';

@Injectable()
export class PublicProductService extends BaseService<Product, IProductRepository> {
  private readonly logger = new Logger(PublicProductService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    protected readonly productRepository: IProductRepository,
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

    // Xử lý categorySlug qua repository filter
    if (prepared.category_slug) {
      prepared.categorySlug = prepared.category_slug;
      delete prepared.category_slug;
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
  protected override transform(product: any): any {
    if (!product) return product;

    // Flatten categories: categories[].category -> categories[]
    if (product.categories && Array.isArray(product.categories)) {
      product.categories = product.categories.map((c: any) => c.category);
    }

    // Calculate price from variants
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => Number(v.sale_price || v.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      product.price = minPrice;
      product.max_price = maxPrice !== minPrice ? maxPrice : null;

      // Calculate sale info
      const salePrices = product.variants
        .filter((v: any) => v.sale_price)
        .map((v: any) => Number(v.sale_price));

      if (salePrices.length > 0) {
        product.sale_price = Math.min(...salePrices);
      }
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
