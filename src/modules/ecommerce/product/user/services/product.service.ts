import { Injectable, Inject } from '@nestjs/common';
import { Product } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { PRODUCT_REPOSITORY, IProductRepository } from '../../domain/product.repository';
import { GetProductsDto } from '../dtos/get-products.dto';

@Injectable()
export class UserProductService extends BaseService<Product, IProductRepository> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    protected readonly productRepository: IProductRepository,
  ) {
    super(productRepository);
  }

  /**
   * Lấy danh sách products
   */
  async getProducts(getProductsDto: GetProductsDto): Promise<any> {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      sort_by = 'created_at',
      sort_order = 'DESC',
      search,
    } = getProductsDto;

    return this.getList({
      status,
      search,
      page,
      limit,
      sort: `${sort_by}:${sort_order}`,
    });
  }

  /**
   * Lấy variants của product - Repository đã include variants mặc định trong defaultSelect
   * Hoặc nếu muốn lấy riêng:
   */
  async getProductVariants(productId: number): Promise<any> {
    const product = await this.productRepository.findById(productId);
    return (product as any)?.variants || [];
  }
}

