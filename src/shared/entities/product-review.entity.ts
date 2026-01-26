import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '@/shared/entities/product.entity';
import { User } from '@/shared/entities/user.entity';
import { Order } from '@/shared/entities/order.entity';
import { BaseEntity } from './base.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('product_reviews')
@Index('idx_product_reviews_product_id', ['product_id'])
@Index('idx_product_reviews_user_id', ['user_id'])
@Index('idx_product_reviews_order_id', ['order_id'])
@Index('idx_product_reviews_status', ['status'])
@Index('idx_product_reviews_rating', ['rating'])
@Index('idx_product_reviews_created_at', ['created_at'])
export class ProductReview extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  product_id: number;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  order_id?: number | null;

  @ManyToOne('Order', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order?: Order | null;

  @Column({ type: 'tinyint', unsigned: true })
  rating: number; // 1-5 stars

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string | null;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'json', nullable: true })
  images?: string[] | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  helpful_count: number;

  @Column({ type: 'boolean', default: false })
  is_verified_purchase: boolean;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Column({ type: 'text', nullable: true })
  admin_reply?: string | null;

  @Column({ type: 'datetime', nullable: true })
  admin_reply_at?: Date | null;
}