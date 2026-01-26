import { Entity, Column, Index } from 'typeorm';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { PaymentType } from '@/shared/enums/payment-type.enum';
import { BaseEntity } from './base.entity';

@Entity('payment_methods')
@Index('idx_payment_methods_code', ['code'], { unique: true })
@Index('idx_payment_methods_status', ['status'])
@Index('idx_payment_methods_type', ['type'])
export class PaymentMethod extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider?: string | null;

  @Column({ type: 'json', nullable: true })
  config?: any | null;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.OFFLINE })
  type: PaymentType;

  @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
  status: BasicStatus;
}


