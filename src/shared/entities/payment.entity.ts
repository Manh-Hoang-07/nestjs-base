import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '@/shared/entities/order.entity';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { BaseEntity } from './base.entity';
import { PaymentType } from '@/shared/enums/payment-type.enum';

@Entity('payments')
  @Index('idx_payments_order_id', ['order_id'])
  @Index('idx_payments_method_id', ['payment_method_id'])
  @Index('idx_payments_status', ['status'])
  @Index('idx_payments_method_type', ['payment_method_type'])
  export class Payment extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  order_id: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'bigint', unsigned: true })
  payment_method_id: number;

  @ManyToOne(() => PaymentMethod, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payment_method_id' })
  payment_method: PaymentMethod;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.OFFLINE, name: 'payment_method_type' })
  payment_method_type: PaymentType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'payment_method_code' })
  payment_method_code?: string | null;

  @Column({ type: 'datetime', nullable: true })
  paid_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  refunded_at?: Date | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;
}


