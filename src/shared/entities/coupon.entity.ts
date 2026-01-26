import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('coupons')
@Index('idx_coupons_code', ['code'], { unique: true })
@Index('idx_coupons_status', ['status'])
@Index('idx_coupons_dates', ['start_date', 'end_date'])
@Index('idx_coupons_group_id', ['group_id'])
export class Coupon extends BaseEntity {

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: string; // Percentage (e.g., 10 for 10%) or Fixed amount

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  min_order_value: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  max_discount_amount?: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  usage_limit?: number | null; // Total usage limit

  @Column({ type: 'int', unsigned: true, default: 1 })
  usage_per_customer: number; // Per customer limit

  @Column({ type: 'int', unsigned: true, default: 0 })
  used_count: number; // Current usage count

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'datetime' })
  end_date: Date;

  @Column({ type: 'enum', enum: CouponStatus, default: CouponStatus.ACTIVE })
  status: CouponStatus;

  @Column({ type: 'json', nullable: true })
  applicable_products?: number[] | null; // Product IDs

  @Column({ type: 'json', nullable: true })
  applicable_categories?: number[] | null; // Category IDs

  @Column({ type: 'json', nullable: true })
  excluded_products?: number[] | null;

  @Column({ type: 'boolean', default: false })
  first_order_only: boolean;

  /**
   * Group/Context mà coupon thuộc về (shop, org...)
   * - NULL = coupon global (áp dụng cho mọi context nếu không filter)
   */
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  group_id?: number | null;
}