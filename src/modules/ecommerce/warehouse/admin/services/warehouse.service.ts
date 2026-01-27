import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '@/shared/entities/warehouse.entity';
import { WarehouseInventory } from '@/shared/entities/warehouse-inventory.entity';
import { StockTransfer, StockTransferStatus } from '@/shared/entities/stock-transfer.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/utils/group-ownership.util';

@Injectable()
export class WarehouseService extends CrudService<Warehouse> {
  constructor(
    @InjectRepository(Warehouse)
    protected readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(WarehouseInventory)
    private readonly inventoryRepository: Repository<WarehouseInventory>,
    @InjectRepository(StockTransfer)
    private readonly transferRepository: Repository<StockTransfer>,
  ) {
    super(warehouseRepository);
  }

  /**
   * Mặc định filter warehouse theo group/context nếu có
   */
  protected override prepareFilters(filters?: any, _options?: any): boolean | any {
    const prepared = { ...(filters || {}) };

    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const groupId = RequestContext.get<number | null>('groupId');

      // Nếu context không phải system (contextId !== 1) và có ref_id, dùng ref_id làm group_id
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = groupId;
      }
    }

    return prepared;
  }

  /**
   * Find nearest warehouse with stock
   */
  async findNearestWarehouseWithStock(
    variantId: number,
    quantity: number,
    customerLocation?: { latitude: number; longitude: number },
  ): Promise<Warehouse | null> {
    // Get warehouses with available stock
    const inventories = await this.inventoryRepository
      .createQueryBuilder('inv')
      .innerJoinAndSelect('inv.warehouse', 'warehouse')
      .where('inv.product_variant_id = :variantId', { variantId })
      .andWhere('warehouse.is_active = true')
      .andWhere('(inv.quantity - inv.reserved_quantity) >= :quantity', { quantity })
      .getMany();

    if (inventories.length === 0) {
      return null;
    }

    // If customer location provided, find nearest
    if (customerLocation && customerLocation.latitude && customerLocation.longitude) {
      let nearestWarehouse = inventories[0].warehouse;
      let minDistance = Infinity;

      for (const inv of inventories) {
        if (inv.warehouse.latitude && inv.warehouse.longitude) {
          const distance = this.calculateDistance(
            customerLocation,
            {
              latitude: parseFloat(inv.warehouse.latitude),
              longitude: parseFloat(inv.warehouse.longitude),
            },
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearestWarehouse = inv.warehouse;
          }
        }
      }

      return nearestWarehouse;
    }

    // Otherwise return highest priority warehouse
    return inventories.sort((a, b) => b.warehouse.priority - a.warehouse.priority)[0].warehouse;
  }

  /**
   * Reserve stock at warehouse
   */
  async reserveStock(
    warehouseId: number,
    variantId: number,
    quantity: number,
  ): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      where: { warehouse_id: warehouseId, product_variant_id: variantId },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const available = inventory.quantity - inventory.reserved_quantity;
    if (available < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.inventoryRepository.increment(
      { id: inventory.id },
      'reserved_quantity',
      quantity,
    );

    return true;
  }

  /**
   * Release reserved stock
   */
  async releaseReservedStock(
    warehouseId: number,
    variantId: number,
    quantity: number,
  ): Promise<void> {
    await this.inventoryRepository.decrement(
      { warehouse_id: warehouseId, product_variant_id: variantId },
      'reserved_quantity',
      quantity,
    );
  }

  /**
   * Deduct stock (after order fulfillment)
   */
  async deductStock(
    warehouseId: number,
    variantId: number,
    quantity: number,
  ): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { warehouse_id: warehouseId, product_variant_id: variantId },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    await this.inventoryRepository.update(inventory.id, {
      quantity: inventory.quantity - quantity,
      reserved_quantity: inventory.reserved_quantity - quantity,
    });
  }

  /**
   * Create stock transfer
   */
  async createStockTransfer(
    fromWarehouseId: number,
    toWarehouseId: number,
    variantId: number,
    quantity: number,
    createdBy: number,
    notes?: string,
  ): Promise<StockTransfer> {
    // Generate transfer number
    const transferNumber = `TRF${Date.now()}`;

    // Check source warehouse has stock
    const fromInventory = await this.inventoryRepository.findOne({
      where: { warehouse_id: fromWarehouseId, product_variant_id: variantId },
    });

    if (!fromInventory || fromInventory.quantity < quantity) {
      throw new BadRequestException('Insufficient stock in source warehouse');
    }

    // Create transfer
    const transfer = await this.transferRepository.save({
      transfer_number: transferNumber,
      from_warehouse_id: fromWarehouseId,
      to_warehouse_id: toWarehouseId,
      product_variant_id: variantId,
      quantity,
      status: StockTransferStatus.PENDING,
      notes,
      created_by: createdBy,
    });

    return transfer;
  }

  /**
   * Approve stock transfer (start transit)
   */
  async approveStockTransfer(
    transferId: number,
    approvedBy: number,
  ): Promise<void> {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.status !== StockTransferStatus.PENDING) {
      throw new BadRequestException('Transfer must be pending to approve');
    }

    await this.transferRepository.update(transferId, {
      status: StockTransferStatus.IN_TRANSIT,
      approved_by: approvedBy,
      approved_at: new Date(),
    });
  }

  /**
   * Complete stock transfer
   */
  async completeStockTransfer(
    transferId: number,
  ): Promise<void> {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.status !== StockTransferStatus.IN_TRANSIT) {
      throw new BadRequestException('Transfer must be in transit to complete');
    }

    // Deduct from source warehouse
    await this.inventoryRepository.decrement(
      {
        warehouse_id: transfer.from_warehouse_id,
        product_variant_id: transfer.product_variant_id,
      },
      'quantity',
      transfer.quantity,
    );

    // Add to destination warehouse
    const toInventory = await this.inventoryRepository.findOne({
      where: {
        warehouse_id: transfer.to_warehouse_id,
        product_variant_id: transfer.product_variant_id,
      },
    });

    if (toInventory) {
      await this.inventoryRepository.increment(
        { id: toInventory.id },
        'quantity',
        transfer.quantity,
      );
    } else {
      // Create new inventory record
      await this.inventoryRepository.save({
        warehouse_id: transfer.to_warehouse_id,
        product_variant_id: transfer.product_variant_id,
        quantity: transfer.quantity,
        reserved_quantity: 0,
        min_stock_level: 0,
      });
    }

    // Update transfer status
    await this.transferRepository.update(transferId, {
      status: StockTransferStatus.COMPLETED,
      completed_at: new Date(),
    });
  }

  /**
   * Cancel stock transfer
   */
  async cancelStockTransfer(transferId: number): Promise<void> {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.status === StockTransferStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed transfer');
    }

    await this.transferRepository.update(transferId, {
      status: StockTransferStatus.CANCELLED,
    });
  }

  /**
   * Get warehouse inventory
   */
  async getWarehouseInventory(
    warehouseId: number,
    filters?: { low_stock?: boolean },
  ): Promise<WarehouseInventory[]> {
    const query = this.inventoryRepository
      .createQueryBuilder('inv')
      .innerJoinAndSelect('inv.variant', 'variant')
      .innerJoinAndSelect('variant.product', 'product')
      .where('inv.warehouse_id = :warehouseId', { warehouseId });

    if (filters?.low_stock) {
      query.andWhere('inv.quantity <= inv.min_stock_level');
    }

    return query.getMany();
  }

  /**
   * Update inventory stock
   */
  async updateInventoryStock(
    warehouseId: number,
    variantId: number,
    quantity: number,
    minStockLevel?: number,
  ): Promise<WarehouseInventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: { warehouse_id: warehouseId, product_variant_id: variantId },
    });

    if (inventory) {
      inventory.quantity = quantity;
      if (minStockLevel !== undefined) {
        inventory.min_stock_level = minStockLevel;
      }
      return this.inventoryRepository.save(inventory);
    } else {
      return this.inventoryRepository.save({
        warehouse_id: warehouseId,
        product_variant_id: variantId,
        quantity,
        reserved_quantity: 0,
        min_stock_level: minStockLevel || 0,
      });
    }
  }

  /**
   * Get stock transfers
   */
  async getStockTransfers(filters?: {
    status?: StockTransferStatus;
    warehouse_id?: number;
  }): Promise<StockTransfer[]> {
    const query = this.transferRepository
      .createQueryBuilder('transfer')
      .innerJoinAndSelect('transfer.from_warehouse', 'from_warehouse')
      .innerJoinAndSelect('transfer.to_warehouse', 'to_warehouse')
      .innerJoinAndSelect('transfer.variant', 'variant')
      .innerJoinAndSelect('variant.product', 'product');

    if (filters?.status) {
      query.andWhere('transfer.status = :status', { status: filters.status });
    }

    if (filters?.warehouse_id) {
      query.andWhere(
        '(transfer.from_warehouse_id = :warehouseId OR transfer.to_warehouse_id = :warehouseId)',
        { warehouseId: filters.warehouse_id },
      );
    }

    return query.orderBy('transfer.created_at', 'DESC').getMany();
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number },
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.latitude)) *
        Math.cos(this.toRad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Override getOne để verify ownership
   */
  override async getOne(where: any, options?: any): Promise<Warehouse | null> {
    const warehouse = await super.getOne(where, options);
    if (warehouse) {
      verifyGroupOwnership(warehouse);
    }
    return warehouse;
  }

  /**
   * Override beforeUpdate để verify ownership
   */
  protected override async beforeUpdate(
    entity: Warehouse,
    updateDto: any,
    response?: any
  ): Promise<boolean> {
    verifyGroupOwnership(entity);
    return true;
  }

  /**
   * Override beforeDelete để verify ownership
   */
  protected override async beforeDelete(
    entity: Warehouse,
    response?: any
  ): Promise<boolean> {
    verifyGroupOwnership(entity);
    return true;
  }
}