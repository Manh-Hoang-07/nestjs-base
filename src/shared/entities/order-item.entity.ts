import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '@/shared/entities/order.entity';
import { Product } from '@/shared/entities/product.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { BaseEntity } from './base.entity';

@Entity('order_items')
@Index('idx_order_items_order_id', ['order_id'])
@Index('idx_order_items_product_id', ['product_id'])
@Index('idx_order_items_variant_id', ['product_variant_id'])
@Index('idx_order_items_product_sku', ['product_sku'])
@Index('idx_order_items_quantity', ['quantity'])
@Index('idx_order_items_unit_total', ['unit_price', 'total_price'])
export class OrderItem extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  order_id: number;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'bigint', unsigned: true })
  product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  product_variant_id?: number | null;

  @ManyToOne(() => ProductVariant, { nullable: true })
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


