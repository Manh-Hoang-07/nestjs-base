import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BaseEntity } from './base.entity';

@Entity('product_categories')
@Index('idx_product_categories_name', ['name'])
@Index('idx_product_categories_slug', ['slug'], { unique: true })
@Index('idx_product_categories_parent_id', ['parent_id'])
@Index('idx_product_categories_status', ['status'])
@Index('idx_product_categories_sort_order', ['sort_order'])
@Index('idx_product_categories_status_sort', ['status', 'sort_order'])
@Index('idx_product_categories_parent_status', ['parent_id', 'status'])
@Index('idx_product_categories_deleted_at', ['deleted_at'])
export class ProductCategory extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parent_id?: number | null;

  @ManyToOne(() => ProductCategory, (c) => c.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: ProductCategory | null;

  @OneToMany(() => ProductCategory, (c) => c.parent)
  children?: ProductCategory[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon?: string | null;

  @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
  status: BasicStatus;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title?: string | null;

  @Column({ type: 'text', nullable: true })
  meta_description?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  canonical_url?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  og_image?: string | null;

  @ManyToMany(() => Product, (product) => product.categories)
  products?: Product[];
}


