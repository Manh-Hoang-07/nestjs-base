import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { Product } from '@/shared/entities/product.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { BaseEntity } from './base.entity';

@Entity('carts')
@Index('idx_carts_cart_header_id', ['cart_header_id'])
@Index('idx_carts_product_id', ['product_id'])
@Index('idx_carts_product_variant_id', ['product_variant_id'])
@Index('idx_carts_quantity', ['quantity'])
@Index('uk_carts_header_product_variant', ['cart_header_id', 'product_id', 'product_variant_id'], { unique: true })
export class Cart extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  cart_header_id: number;

  @ManyToOne('CartHeader', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_header_id' })
  header: CartHeader;

  @Column({ type: 'bigint', unsigned: true })
  product_id: number;

  @ManyToOne('Product')
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  product_variant_id?: number | null;

  @ManyToOne('ProductVariant', { nullable: true })
  @JoinColumn({ name: 'product_variant_id' })
  variant?: ProductVariant | null;

  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column({ type: 'varchar', length: 100 })
  product_sku: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variant_name?: string | null;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_price: string;

  @Column({ type: 'json', nullable: true })
  product_attributes?: any | null;
}


