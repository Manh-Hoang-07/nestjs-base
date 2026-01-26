import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { ListService } from '@/common/base/services/list.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Injectable()
export class PublicProductService extends ListService<Product> {
  private readonly logger = new Logger(PublicProductService.name);

  constructor(
    @InjectRepository(Product)
    protected readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
  ) {
    super(productRepository);
  }

  /**
   * Override prepareOptions để load relations mặc định
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      select: ['id', 'name', 'slug', 'description', 'short_description', 'image', 'gallery', 'status', 'is_featured', 'is_variable', 'is_digital'],
      relations: [
        { name: 'variants', select: ['id', 'name', 'sku', 'price', 'sale_price', 'stock_quantity', 'weight', 'image', 'status'] },
        { name: 'categories', select: ['id', 'name', 'slug', 'description', 'image', 'icon', 'status', 'sort_order'] },
      ],
      // Tối ưu hóa cho public products
      maxLimit: queryOptions.maxLimit || 100, // Giới hạn thấp hơn cho public API
      enableCache: queryOptions.enableCache !== false, // Mặc định bật cache cho public API
      cacheTTL: queryOptions.cacheTTL || 600, // 10 minutes cache cho products
    } as any;
  }

  /**
   * Override prepareFilters để thêm filter cho active status và xử lý productIds
   */
  protected override prepareFilters(
    filters?: any,
    _options?: any,
  ): boolean | any {
    const baseFilters = {
      ...filters,
      status: ProductStatus.ACTIVE,
    };

    // Xử lý productIds: chuyển thành filter id: In(productIds)
    if (filters?.productIds && Array.isArray(filters.productIds)) {
      const { productIds, ...otherFilters } = filters;
      
      // Nếu không có product IDs, trả về false để skip query (trả về empty result)
      if (productIds.length === 0) {
        return false;
      }

      return {
        ...otherFilters,
        status: ProductStatus.ACTIVE,
        id: In(productIds), // Sử dụng In() operator của TypeORM
      };
    }

    return baseFilters;
  }

  /**
   * Lấy variants của product
   */
  async getProductVariants(productId: number): Promise<any> {
    this.logger.debug(`getProductVariants called for product: ${productId}`);

    const variants = await this.productVariantRepository.find({
      where: { product_id: productId, status: BasicStatus.Active },
      order: { created_at: 'ASC' },
    });

    this.logger.debug(`Found ${variants.length} variants for product ${productId}`);
    return variants;
  }

  /**
   * Lấy danh sách sản phẩm theo slug của danh mục
   */
  async getProductsByCategorySlug(
    categorySlug: string,
    query: any = {}
  ): Promise<any> {
    this.logger.debug(`getProductsByCategorySlug called for category: ${categorySlug}`);

    // Tìm category theo slug
    const category = await this.productCategoryRepository.findOne({
      where: { slug: categorySlug, status: BasicStatus.Active },
    });

    if (!category) {
      throw new Error(`Category with slug '${categorySlug}' not found`);
    }

    // Tìm tất cả product IDs thuộc category này thông qua quan hệ ManyToMany
    // Sử dụng QueryBuilder để query ManyToMany relationship
    const products = await this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.categories', 'category')
      .where('category.id = :categoryId', { categoryId: category.id })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .select('product.id')
      .getMany();

    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
      return {
        data: [],
        pagination: {
          page: query.page || 1,
          limit: query.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Sử dụng prepareQuery để xử lý query parameters
    const { filters, options } = prepareQuery(query);

    // Tạo filters tùy chỉnh để xử lý product IDs
    const customFilters = {
      ...filters,
      productIds, // Thêm productIds vào filters
      status: ProductStatus.ACTIVE,
    };

    // Sử dụng getList từ ListService với filters đã được tùy chỉnh
    return this.getList(customFilters, options);
  }

  /**
   * Hook xử lý dữ liệu sau khi lấy một sản phẩm từ database
   * Ví dụ: Thêm thông tin tính toán, định dạng lại dữ liệu, v.v.
   */
  protected async afterGetOne(
    product: Product,
    where?: any,
    options?: any
  ): Promise<Product> {
    if (product && product.categories && product.categories.length > 0) {
      product.category_ids = product.categories.map(c => c.id);
    }
    return product;
  }
}