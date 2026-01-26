import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { ProductVariant } from './product-variant.entity';
import { BaseEntity } from './base.entity';

@Entity('warehouse_inventory')
@Index('idx_warehouse_inventory_warehouse_id', ['warehouse_id'])
@Index('idx_warehouse_inventory_variant_id', ['product_variant_id'])
@Unique('uk_warehouse_variant', ['warehouse_id', 'product_variant_id'])
export class WarehouseInventory extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  warehouse_id: number;

  @ManyToOne(() => Warehouse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'bigint', unsigned: true })
  product_variant_id: number;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int', unsigned: true, default: 0 })
  quantity: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  reserved_quantity: number; // Reserved for pending orders

  @Column({ type: 'int', unsigned: true, default: 0 })
  min_stock_level: number;
}