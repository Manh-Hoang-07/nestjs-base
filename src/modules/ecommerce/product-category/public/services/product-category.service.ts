import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductCategoryRepository, PRODUCT_CATEGORY_REPOSITORY } from '../../domain/product-category.repository';
import { IProductRepository, PRODUCT_REPOSITORY } from '@/modules/ecommerce/product/domain/product.repository';
import { GetCategoriesDto } from '../dtos/get-categories.dto';
import { GetCategoryDto } from '../dtos/get-category.dto';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { ProductStatus } from '@/shared/enums/types/product-status.enum';
import { createPaginatedResult } from '@/common/core/utils/pagination.helper';

@Injectable()
export class PublicProductCategoryService extends BaseService<ProductCategory, IProductCategoryRepository> {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    protected readonly productCategoryRepository: IProductCategoryRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {
    super(productCategoryRepository);
  }

  /**
   * Lấy danh sách categories - chỉ trả về categories gốc với children hoặc theo format
   */
  async getCategories(getCategoriesDto: GetCategoriesDto): Promise<any> {
    const {
      page = 1,
      limit = 50,
      status = 'active',
      sort_by = 'sort_order',
      sort_order = 'asc',
      format = 'tree',
      ...rest
    } = getCategoriesDto;

    const basicStatus = status === 'active' ? BasicStatus.active : BasicStatus.inactive;

    if (format === 'flat') {
      return this.getList({
        filter: { status: basicStatus, ...rest },
        page,
        limit,
        sort: `${sort_by}:${sort_order}`
      });
    }

    // Format 'tree': Lấy từ repository
    const tree = await this.productCategoryRepository.getTree();

    // Manual pagination for tree (basic implementation)
    const startIndex = (page - 1) * limit;
    const paginatedTree = tree.slice(startIndex, startIndex + limit);

    return createPaginatedResult(paginatedTree, page, limit, tree.length);
  }

  /**
   * Lấy category theo slug
   */
  async getCategoryBySlug(slug: string, _getCategoryDto: GetCategoryDto): Promise<any> {
    const category = await this.productCategoryRepository.findBySlug(slug);
    if (!category || category.status !== BasicStatus.active) {
      throw new NotFoundException('Category not found');
    }
    return this.transform(category);
  }

  /**
   * Lấy products của category
   */
  async getCategoryProducts(categoryId: number | bigint, options: { page?: number; limit?: number } = {}): Promise<any> {
    const { page = 1, limit = 10 } = options;

    const result = await this.productRepository.findAll({
      page,
      limit,
      filter: {
        status: ProductStatus.active,
        categoryId: BigInt(categoryId)
      },
      sort: 'created_at:DESC'
    });

    return result;
  }
}

