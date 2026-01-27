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

    return prepared;
  }

  /**
   * Lấy chi tiết sản phẩm theo slug
   */
  async getBySlug(slug: string): Promise<Product | null> {
    return this.productRepository.findBySlug(slug);
  }

  async getProductVariants(productId: number | bigint): Promise<any> {
    return this.productRepository.findVariants(productId);
  }
}