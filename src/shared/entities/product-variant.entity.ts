import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductVariantAttribute } from '@/shared/entities/product-variant-attribute.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BaseEntity } from './base.entity';

@Entity('product_variants')
@Index('idx_product_variants_product_id', ['product_id'])
@Index('idx_product_variants_sku', ['sku'], { unique: true })
@Index('idx_product_variants_name', ['name'])
@Index('idx_product_variants_price', ['price'])
@Index('idx_product_variants_sale_price', ['sale_price'])
@Index('idx_product_variants_stock', ['stock_quantity'])
@Index('idx_product_variants_status', ['status'])
@Index('idx_product_variants_product_status', ['product_id', 'status'])
@Index('idx_product_variants_status_stock', ['status', 'stock_quantity'])
@Index('idx_product_variants_deleted_at', ['deleted_at'])
export class ProductVariant extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  product_id: number;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  sale_price?: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cost_price?: string | null;

  @Column({ type: 'int', default: 0 })
  stock_quantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string | null;

  @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
  status: BasicStatus;

  // Relations
  @OneToMany('ProductVariantAttribute', 'variant')
  attributes?: ProductVariantAttribute[];
}


