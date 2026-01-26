import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductCategory } from '@/shared/entities/product-category.entity';

@Entity('product_category')
@Index('idx_ppc_product_id', ['product_id'])
@Index('idx_ppc_category_id', ['product_category_id'])
@Unique('uk_ppc_product_category', ['product_id', 'product_category_id'])
export class ProductProductCategory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  product_id: number;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'bigint', unsigned: true })
  product_category_id: number;

  @ManyToOne('ProductCategory', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_category_id' })
  category: ProductCategory;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


