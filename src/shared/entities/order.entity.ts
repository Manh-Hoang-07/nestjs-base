import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { User } from './user.entity';
import { ShippingMethod } from './shipping-method.entity';
import { PaymentMethod } from './payment-method.entity';
import { Payment } from './payment.entity';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { PaymentStatus } from '@/shared/enums/payment-status.enum';
import { ShippingStatus } from '@/shared/enums/shipping-status.enum';
import { OrderType } from '@/shared/enums/order-type.enum';
import { BaseEntity } from './base.entity';

@Entity('orders')
@Index('idx_orders_order_number', ['order_number'], { unique: true })
@Index('idx_orders_user_id', ['user_id'])
@Index('idx_orders_session_token', ['session_token'])
@Index('idx_orders_customer_email', ['customer_email'])
@Index('idx_orders_customer_phone', ['customer_phone'])
@Index('idx_orders_status', ['status'])
@Index('idx_orders_payment_status', ['payment_status'])
@Index('idx_orders_shipping_status', ['shipping_status'])
@Index('idx_orders_total_amount', ['total_amount'])
@Index('idx_orders_tracking_number', ['tracking_number'])
@Index('idx_orders_status_created', ['status', 'created_at'])
@Index('idx_orders_payment_created', ['payment_status', 'created_at'])
@Index('idx_orders_user_status', ['user_id', 'status'])
@Index('idx_orders_deleted_at', ['deleted_at'])
@Index('idx_orders_order_type', ['order_type'])
@Index('idx_orders_group_id', ['group_id'])
export class Order extends BaseEntity {

  @Column({ type: 'varchar', length: 50, unique: true })
  order_number: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  user_id?: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  session_token?: string | null;

  @Column({ type: 'varchar', length: 255 })
  customer_name: string;

  @Column({ type: 'varchar', length: 255 })
  customer_email: string;

  @Column({ type: 'varchar', length: 20 })
  customer_phone: string;

  @Column({ type: 'json' })
  shipping_address: any;

  @Column({ type: 'json' })
  billing_address: any;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  shipping_method_id?: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  payment_method_id?: number | null;

  @Column({ type: 'enum', enum: OrderType, default: OrderType.PHYSICAL })
  order_type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @Column({ type: 'enum', enum: ShippingStatus, default: ShippingStatus.PENDING })
  shipping_status: ShippingStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax_amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shipping_amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount_amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: string;

  @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tracking_number?: string | null;

  @Column({ type: 'datetime', nullable: true })
  shipped_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  delivered_at?: Date | null;

  /**
   * Group/Context mà order thuộc về (shop, org, project...)
   * - Cho phép thống kê, filter theo context
   */
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  group_id?: number | null;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @ManyToOne(() => ShippingMethod, { nullable: true })
  @JoinColumn({ name: 'shipping_method_id' })
  shipping_method?: ShippingMethod | null;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'payment_method_id' })
  payment_method?: PaymentMethod | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}


