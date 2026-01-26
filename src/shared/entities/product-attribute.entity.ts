import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BaseEntity } from './base.entity';

@Entity('product_attributes')
@Index('idx_product_attributes_name', ['name'])
@Index('idx_product_attributes_slug', ['slug'], { unique: true })
@Index('idx_product_attributes_type', ['type'])
@Index('idx_product_attributes_required', ['is_required'])
@Index('idx_product_attributes_variation', ['is_variation'])
@Index('idx_product_attributes_filterable', ['is_filterable'])
@Index('idx_product_attributes_status', ['status'])
@Index('idx_product_attributes_sort_order', ['sort_order'])
@Index('idx_product_attributes_status_sort', ['status', 'sort_order'])
@Index('idx_product_attributes_variation_status', ['is_variation', 'status'])
@Index('idx_product_attributes_deleted_at', ['deleted_at'])
export class ProductAttribute extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'enum', enum: ['text', 'select', 'multiselect', 'color', 'image'], default: 'text' })
  type: 'text' | 'select' | 'multiselect' | 'color' | 'image';

  @Column({ type: 'boolean', default: false })
  is_required: boolean;

  @Column({ type: 'boolean', default: false })
  is_variation: boolean;

  @Column({ type: 'boolean', default: true })
  is_filterable: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
  status: BasicStatus;
}


