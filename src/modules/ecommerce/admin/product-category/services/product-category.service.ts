import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class AdminProductCategoryService extends CrudService<ProductCategory> {
  constructor(
    @InjectRepository(ProductCategory)
    protected readonly productCategoryRepository: Repository<ProductCategory>,
  ) {
    super(productCategoryRepository);
  }

  /**
   * Override prepareOptions để load relations mặc định
   */
  protected prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['parent', 'children'],
    } as any;
  }

  /**
   * Lấy cây categories - sử dụng getList từ base
   */
  async findTree(): Promise<ProductCategory[]> {
    const result = await this.getList(
      { status: BasicStatus.Active },
      { sort: 'name:ASC', limit: 1000 }
    );
    return result.data;
  }

  /**
   * Lấy children categories - sử dụng getList từ base
   */
  async findChildren(parentId: number): Promise<ProductCategory[]> {
    const result = await this.getList(
      { parent_id: parentId },
      { sort: 'name:ASC', limit: 1000 }
    );
    return result.data;
  }

  /**
   * Lấy root categories - sử dụng getList từ base
   */
  async findRootCategories(): Promise<ProductCategory[]> {
    const result = await this.getList(
      { parent_id: IsNull() },
      { sort: 'name:ASC', limit: 1000 }
    );
    return result.data;
  }

}