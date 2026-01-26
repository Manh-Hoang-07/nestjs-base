import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('warehouses')
@Index('idx_warehouses_code', ['code'], { unique: true })
@Index('idx_warehouses_is_active', ['is_active'])
@Index('idx_warehouses_priority', ['priority'])
@Index('idx_warehouses_group_id', ['group_id'])
export class Warehouse extends BaseEntity {

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manager_name?: string | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  priority: number; // Higher priority warehouses checked first

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * Group/Context sở hữu warehouse (shop, org...)
   */
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  group_id?: number | null;
}