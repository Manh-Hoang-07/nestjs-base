import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { GetProductsDto } from '@/modules/ecommerce/user/product/dtos/get-products.dto';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { ListService } from '@/common/base/services/list.service';

@Injectable()
export class UserProductService extends ListService<Product> {
  constructor(
    @InjectRepository(Product)
    protected readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
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
      relations: ['variants', 'categories'],
    } as any;
  }

  /**
   * Lấy danh sách products - đơn giản hóa, dùng getList từ base
   */
  async getProducts(getProductsDto: GetProductsDto): Promise<any> {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = getProductsDto;

    // Đơn giản hóa: chỉ filter cơ bản, bỏ search và price filter phức tạp
    const filters: any = { status };

    return this.getList(filters, {
      page,
      limit,
      sort: `${sort_by}:${sort_order}`,
    });
  }


  /**
   * Lấy variants của product - giữ nguyên vì cần repository riêng
   */
  async getProductVariants(productId: number): Promise<any> {
    const variants = await this.productVariantRepository.find({
      where: { product_id: productId, status: BasicStatus.Active },
      order: { created_at: 'ASC' },
    });
    return variants;
  }




}