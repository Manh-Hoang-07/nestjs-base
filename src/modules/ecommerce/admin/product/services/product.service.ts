import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/utils/group-ownership.util';

@Injectable()
export class AdminProductService extends CrudService<Product> {
  constructor(
    @InjectRepository(Product)
    protected readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
  ) {
    super(productRepository);
  }

  // Biến tạm để lưu trữ category_ids khi tạo sản phẩm
  private tempCategoryIds: string[] = [];

  /**
   * Áp dụng filter theo group/context mặc định nếu có contextId
   */
  protected override prepareFilters(
    filters?: any,
    _options?: any,
  ): boolean | any {
    const prepared = { ...(filters || {}) };

    // Nếu đã truyền group_id trong filters thì không override
    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const context: any = RequestContext.get('context');
      const groupId = RequestContext.get<number | null>('groupId');

      // Nếu context không phải system (contextId !== 1) và có ref_id, dùng ref_id làm group_id
      // System context (id=1) → group_id = null (lấy tất cả products global)
      // Context khác (shop, team, ...) → group_id = context.ref_id (chỉ lấy products của group đó)
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = groupId;
      } else if (contextId === 1) {
        // System context: có thể lấy tất cả hoặc chỉ lấy products không có group_id
        // Ở đây để null để lấy tất cả (bao gồm cả products có và không có group_id)
        // Nếu muốn chỉ lấy products global, set: prepared.group_id = null
      }
    }

    return prepared;
  }

  /**
   * Hook trước khi tạo
   */
  protected async beforeCreate(entity: Product, createDto: any): Promise<boolean> {
    await this.ensureSlug(createDto);

    // Xử lý category_ids nếu có
    if (createDto.category_ids && Array.isArray(createDto.category_ids) && createDto.category_ids.length > 0) {
      // Lưu category_ids vào biến tạm để xử lý sau khi tạo entity
      this.tempCategoryIds = createDto.category_ids;
      // Xóa category_ids khỏi createDto vì không phải là trường của Product
      delete createDto.category_ids;
    }

    return true;
  }

  /**
   * Hook trước khi update
   */
  protected override async beforeUpdate(
    entity: Product,
    updateDto: any,
    response?: any
  ): Promise<boolean> {
    // Verify ownership trước
    verifyGroupOwnership(entity);

    await this.ensureSlug(updateDto, entity.id, entity.slug);

    // Xử lý category_ids nếu có
    if (updateDto.category_ids && Array.isArray(updateDto.category_ids) && updateDto.category_ids.length > 0) {
      // Load product với categories hiện tại
      const productWithCategories = await this.productRepository.findOne({
        where: { id: entity.id },
        relations: ['categories'],
      });
      
      if (productWithCategories) {
        // Tìm các categories mới
        const categoryIds = updateDto.category_ids.map((id: string) => parseInt(id, 10));
        const categories = await this.productCategoryRepository.find({
          where: { id: In(categoryIds) },
        });
        
        // Gán categories mới
        productWithCategories.categories = categories;
        await this.productRepository.save(productWithCategories);
      }
      
      // Xóa category_ids khỏi updateDto vì không phải là trường của Product
      delete updateDto.category_ids;
    }

    return true;
  }

  /**
   * Hook sau khi tạo entity
   */
  protected async afterCreate(entity: Product, createDto: any): Promise<void> {
    // Xử lý category_ids nếu có (đã được lưu trong biến tạm)
    if (this.tempCategoryIds && this.tempCategoryIds.length > 0) {
      // Tìm các categories
      const categoryIds = this.tempCategoryIds.map((id: string) => parseInt(id, 10));
      const categories = await this.productCategoryRepository.find({
        where: { id: In(categoryIds) },
      });
      
      // Load product với categories
      const productWithCategories = await this.productRepository.findOne({
        where: { id: entity.id },
        relations: ['categories'],
      });
      
      if (productWithCategories) {
        // Gán categories
        productWithCategories.categories = categories;
        await this.productRepository.save(productWithCategories);
      }

      // Xóa tạm category_ids
      this.tempCategoryIds = [];
    }
  }

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

  /**
   * Override getOne để verify ownership
   */
  override async getOne(where: any, options?: any): Promise<Product | null> {
    const product = await super.getOne(where, options);
    if (product) {
      verifyGroupOwnership(product);
    }
    return product;
  }

  /**
   * Override beforeDelete để verify ownership
   */
  protected override async beforeDelete(
    entity: Product,
    response?: any
  ): Promise<boolean> {
    verifyGroupOwnership(entity);
    return true;
  }

}