import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { ProductVariant } from './product-variant.entity';
import { BaseEntity } from './base.entity';

export enum StockTransferStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('stock_transfers')
@Index('idx_stock_transfers_from_warehouse', ['from_warehouse_id'])
@Index('idx_stock_transfers_to_warehouse', ['to_warehouse_id'])
@Index('idx_stock_transfers_status', ['status'])
@Index('idx_stock_transfers_number', ['transfer_number'], { unique: true })
export class StockTransfer extends BaseEntity {

  @Column({ type: 'varchar', length: 50, unique: true })
  transfer_number: string;

  @Column({ type: 'bigint', unsigned: true })
  from_warehouse_id: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'from_warehouse_id' })
  from_warehouse: Warehouse;

  @Column({ type: 'bigint', unsigned: true })
  to_warehouse_id: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'to_warehouse_id' })
  to_warehouse: Warehouse;

  @Column({ type: 'bigint', unsigned: true })
  product_variant_id: number;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int', unsigned: true })
  quantity: number;

  @Column({ type: 'enum', enum: StockTransferStatus, default: StockTransferStatus.PENDING })
  status: StockTransferStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'bigint', unsigned: true })
  created_by: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  approved_by?: number | null;

  @Column({ type: 'datetime', nullable: true })
  approved_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  completed_at?: Date | null;
}