import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export enum PromotionType {
  BUY_X_GET_Y = 'buy_x_get_y',
  BUNDLE = 'bundle',
  FLASH_SALE = 'flash_sale',
  COMBO = 'combo',
}

export enum PromotionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('promotions')
@Index('idx_promotions_type', ['type'])
@Index('idx_promotions_status', ['status'])
@Index('idx_promotions_dates', ['start_date', 'end_date'])
@Index('idx_promotions_priority', ['priority'])
export class Promotion extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  // Rules stored as JSON
  // Example for BUY_X_GET_Y: { buy: 2, get: 1, apply_to: 'cheapest' }
  // Example for BUNDLE: { products: [1,2,3], discount: 20 }
  @Column({ type: 'json' })
  rules: any;

  @Column({ type: 'json', nullable: true })
  applicable_products?: number[] | null;

  @Column({ type: 'json', nullable: true })
  applicable_categories?: number[] | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  priority: number; // Higher priority applies first

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'datetime' })
  end_date: Date;

  @Column({ type: 'enum', enum: PromotionStatus, default: PromotionStatus.ACTIVE })
  status: PromotionStatus;

  @Column({ type: 'int', unsigned: true, nullable: true })
  usage_limit?: number | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  used_count: number;
}