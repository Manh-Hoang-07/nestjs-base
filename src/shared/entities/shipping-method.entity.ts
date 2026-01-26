import { Entity, Column, Index } from 'typeorm';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BaseEntity } from './base.entity';

@Entity('shipping_methods')
@Index('idx_shipping_methods_code', ['code'], { unique: true })
@Index('idx_shipping_methods_status', ['status'])
export class ShippingMethod extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_cost: string;

  @Column({ type: 'int', nullable: true })
  estimated_days?: number | null;

  @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
  status: BasicStatus;
}


