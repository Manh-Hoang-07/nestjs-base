import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductAttribute } from '@/shared/entities/product-attribute.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BaseEntity } from './base.entity';

@Entity('product_attribute_values')
@Index('idx_pav_attribute_id', ['product_attribute_id'])
@Index('idx_pav_value', ['value'])
@Index('idx_pav_color_code', ['color_code'])
@Index('idx_pav_status', ['status'])
@Index('idx_pav_sort_order', ['sort_order'])
@Index('idx_pav_attr_status', ['product_attribute_id', 'status'])
@Index('idx_pav_attr_sort', ['product_attribute_id', 'sort_order'])
@Index('idx_pav_deleted_at', ['deleted_at'])
export class ProductAttributeValue extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  product_attribute_id: number;

  @ManyToOne('ProductAttribute', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_attribute_id' })
  attribute: ProductAttribute;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color_code?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
  status: BasicStatus;
}


