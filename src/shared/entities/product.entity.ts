import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductCategory } from './product-category.entity';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { BaseEntity } from './base.entity';

@Entity('products')
@Index('idx_products_name', ['name'])
@Index('idx_products_slug', ['slug'], { unique: true })
@Index('idx_products_sku', ['sku'], { unique: true })
@Index('idx_products_status', ['status'])
@Index('idx_products_is_featured', ['is_featured'])
@Index('idx_products_is_variable', ['is_variable'])
@Index('idx_products_is_digital', ['is_digital'])
@Index('idx_products_status_featured', ['status', 'is_featured'])
@Index('idx_products_status_created', ['status', 'created_at'])
@Index('idx_products_deleted_at', ['deleted_at'])
@Index('idx_products_group_id', ['group_id'])
export class Product extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'longtext', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  short_description?: string | null;

  @Column({ type: 'int', default: 0 })
  min_stock_level: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string | null;

  @Column({ type: 'json', nullable: true })
  gallery?: any | null;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  is_variable: boolean;

  @Column({ type: 'boolean', default: false })
  is_digital: boolean;

  @Column({ type: 'int', nullable: true })
  download_limit?: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title?: string | null;

  @Column({ type: 'text', nullable: true })
  meta_description?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  canonical_url?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  og_title?: string | null;

  @Column({ type: 'text', nullable: true })
  og_description?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  og_image?: string | null;

  /**
   * Group/Context owner của product (shop, org, project...)
   * - Mặc định NULL → thuộc system/global catalog
   * - Khi chạy đa-tenant: luôn set theo group hiện tại
   */
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  group_id?: number | null;

  // Relations
  @OneToMany('ProductVariant', 'product')
  variants?: ProductVariant[];

  @ManyToMany(() => ProductCategory, (category) => category.products)
  @JoinTable({
    name: 'product_category',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_category_id', referencedColumnName: 'id' },
  })
  categories?: ProductCategory[];
  category_ids: Object | null;
}


