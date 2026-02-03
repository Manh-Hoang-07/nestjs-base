import { Injectable, Inject } from '@nestjs/common';
import { ProductCategory, Product } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductCategoryRepository, PRODUCT_CATEGORY_REPOSITORY } from '../../domain/product-category.repository';
import { IProductRepository, PRODUCT_REPOSITORY } from '@/modules/ecommerce/product/domain/product.repository';
import { GetCategoriesDto } from '../dtos/get-categories.dto';

@Injectable()
export class UserProductCategoryService extends BaseService<ProductCategory, IProductCategoryRepository> {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    protected readonly productCategoryRepository: IProductCategoryRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {
    super(productCategoryRepository);
  }

  /**
   * Lấy danh sách categories - hỗ trợ cây hoặc phẳng
   */
  async getCategories(getCategoriesDto: GetCategoriesDto): Promise<any> {
    const {
      status = 'active',
      format = 'tree'
    } = getCategoriesDto;

    if (format === 'tree') {
      const tree = await this.productCategoryRepository.getTree();
      // Filter by status if needed, but getTree might already handle it or we filter in memory
      const filteredTree = status === 'active'
        ? tree.filter(cat => cat.status === 'active')
        : tree;

      return filteredTree.map(cat => this.transform(cat));
    }

    // Format 'flat'
    return this.getList(getCategoriesDto);
  }

  /**
   * Lấy products của category
   */
  async getCategoryProducts(categoryId: number | bigint, options: any = {}): Promise<any> {
    return this.productRepository.findAll({
      ...options,
      filter: {
        categoryId,
        status: 'active',
      },
    });
  }
}

