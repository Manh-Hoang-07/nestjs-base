import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from './user.entity';
import { Order } from './order.entity';
import { BaseEntity } from './base.entity';

@Entity('coupon_usage')
@Index('idx_coupon_usage_coupon_id', ['coupon_id'])
@Index('idx_coupon_usage_user_id', ['user_id'])
@Index('idx_coupon_usage_order_id', ['order_id'])
@Index('idx_coupon_usage_user_coupon', ['user_id', 'coupon_id'])
@Index('idx_coupon_usage_deleted_at', ['deleted_at'])
export class CouponUsage extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  coupon_id: number;

  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', unsigned: true })
  order_id: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  discount_amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  order_total: string;

  @CreateDateColumn({ name: 'used_at' })
  used_at: Date;
}