import { Entity, Column, Index, OneToMany } from 'typeorm';
import { Cart } from './cart.entity';
import { BaseEntity } from './base.entity';

@Entity('cart_headers')
@Index('idx_cart_headers_owner_key', ['owner_key'])
@Index('idx_cart_headers_user_id', ['user_id'])
export class CartHeader extends BaseEntity {

  @Column({ type: 'varchar', length: 36, unique: true, nullable: true })
  uuid?: string | null;

  @Column({ type: 'varchar', length: 120 })
  owner_key: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  user_id?: number | null;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax_amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shipping_amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount_amount: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  coupon_code?: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: string;

  // Relations
  @OneToMany(() => Cart, (cart) => cart.header)
  items?: Cart[];
}


