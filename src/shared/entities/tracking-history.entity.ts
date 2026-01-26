import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { BaseEntity } from './base.entity';

@Entity('tracking_history')
@Index('idx_tracking_history_order_id', ['order_id'])
@Index('idx_tracking_history_timestamp', ['timestamp'])
@Index('idx_tracking_history_status', ['status'])
export class TrackingHistory extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  order_id: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shipping_provider?: string | null;

  @Column({ type: 'json', nullable: true })
  metadata?: any; // Provider-specific data

  @Column({ type: 'datetime' })
  timestamp: Date;
}