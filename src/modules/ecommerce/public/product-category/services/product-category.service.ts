import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { Product } from '@/shared/entities/product.entity';
import { GetCategoriesDto } from '@/modules/ecommerce/public/product-category/dtos/get-categories.dto';
import { GetCategoryDto } from '@/modules/ecommerce/public/product-category/dtos/get-category.dto';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { ListService } from '@/common/base/services/list.service';
import { createPaginatedResult } from '@/common/base/utils/pagination.helper';

@Injectable()
export class PublicProductCategoryService extends ListService<ProductCategory> {
  constructor(
    @InjectRepository(ProductCategory)
    protected readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(productCategoryRepository);
  }

  /**
   * Override prepareOptions để load relations mặc định
   */
  protected prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    // Chỉ thêm relations children khi không phải format 'flat'
    if (queryOptions.format === 'flat') {
      return {
        ...base,
        relations: [], // Không load relations cho format flat
      };
    }
    return {
      ...base,
      relations: ['children'],
    };
  }

  /**
   * Lấy danh sách categories - chỉ trả về categories gốc với children bên trong
   */
  async getCategories(getCategoriesDto: GetCategoriesDto): Promise<any> {
    const {
      page = 1,
      limit = 50,
      status = 'active',
      sort_by = 'sort_order',
      sort_order = 'ASC',
      format = 'tree'
    } = getCategoriesDto;

    // Nếu format là 'flat', dùng repository query trực tiếp để tránh relations
    if (format === 'flat') {
      // Validate sort_by để tránh lỗi "Property ... was not found" từ TypeORM
      const validColumns = this.productCategoryRepository.metadata.columns.map((c: any) => c.propertyName);
      const sortBy = (sort_by || '').trim();
      const safeSortBy =
        sortBy && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortBy) && validColumns.includes(sortBy)
          ? sortBy
          : 'sort_order';

      const [data, total] = await this.productCategoryRepository.findAndCount({
        where: { status: status === 'active' ? BasicStatus.Active : BasicStatus.Inactive },
        order: { [safeSortBy]: sort_order },
        skip: (page - 1) * limit,
        take: limit,
      });

      return createPaginatedResult(data, page, limit, total);
    }

    // Format 'tree': Lấy dữ liệu và xây dựng cấu trúc cây
    const options = this.prepareOptions({ page, limit, sort: `${sort_by}:${sort_order}`, format: 'tree' });
    const result = await this.getList(
      { status },
      options
    );

    return this.buildTreeStructure(result.data, status, page, limit);
  }

  /**
   * Xây dựng cấu trúc cây từ danh sách phẳng
   */
  private buildTreeStructure(categories: any[], status: string, page: number, limit: number): any {
    // Tìm categories gốc (parent_id = null)
    const rootCategories = categories.filter(cat => cat.parent_id === null);

    // Xây dựng cây
    const treeData = rootCategories.map(category => {
      const children = categories.filter(cat => cat.parent_id === category.id);
      return {
        ...category,
        children: children.filter(child =>
          child.status === (status === 'active' ? BasicStatus.Active : BasicStatus.Inactive)
        )
      };
    });

    // Tính toán meta cho phân trang (chỉ tính categories gốc)
    const total = rootCategories.length;

    return createPaginatedResult(treeData, page, limit, total);
  }

  /**
   * Lấy category theo slug - dùng getOne từ base
   */
  async getCategoryBySlug(slug: string, getCategoryDto: GetCategoryDto): Promise<any> {
    return this.getOne({ slug, status: BasicStatus.Active });
  }

  /**
   * Lấy products của category - giữ đơn giản
   */
  async getCategoryProducts(categoryId: number, options: { page?: number; limit?: number } = {}): Promise<any> {
    const { page = 1, limit = 10 } = options;

    // Đơn giản: chỉ load products active
    const products = await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    const total = await this.productRepository.count({
      where: { status: ProductStatus.ACTIVE },
    });

    return createPaginatedResult(products, page, limit, total);
  }

}