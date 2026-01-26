import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { ProductAttribute } from '@/shared/entities/product-attribute.entity';
import { ProductAttributeValue } from '@/shared/entities/product-attribute-value.entity';

@Entity('product_variant_attributes')
@Index('idx_pva_variant_id', ['product_variant_id'])
@Index('idx_pva_attribute_id', ['product_attribute_id'])
@Index('idx_pva_value_id', ['product_attribute_value_id'])
@Unique('uk_pva_variant_attribute', ['product_variant_id', 'product_attribute_id'])
export class ProductVariantAttribute {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  product_variant_id: number;

  @ManyToOne('ProductVariant', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;

  @Column({ type: 'bigint', unsigned: true })
  product_attribute_id: number;

  @ManyToOne('ProductAttribute', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_attribute_id' })
  attribute: ProductAttribute;

  @Column({ type: 'bigint', unsigned: true })
  product_attribute_value_id: number;

  @ManyToOne('ProductAttributeValue', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_attribute_value_id' })
  value: ProductAttributeValue;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


