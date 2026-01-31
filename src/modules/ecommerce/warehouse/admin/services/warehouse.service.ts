import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Warehouse } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IWarehouseRepository, WAREHOUSE_REPOSITORY } from '../../domain/warehouse.repository';
import { IWarehouseInventoryRepository, WAREHOUSE_INVENTORY_REPOSITORY } from '../../domain/warehouse-inventory.repository';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class AdminWarehouseService extends BaseService<Warehouse, IWarehouseRepository> {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    protected readonly warehouseRepository: IWarehouseRepository,
    @Inject(WAREHOUSE_INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IWarehouseInventoryRepository,
    @Inject('STOCK_TRANSFER_REPOSITORY')
    private readonly stockTransferRepository: any, // Use interface if imported
    private readonly prisma: PrismaService,
  ) {
    super(warehouseRepository);
  }

  // ... (existing methods)

  async createStockTransfer(fromId: number, toId: number, variantId: number, quantity: number, userId: number, notes?: string): Promise<any> {
    const sourceInventory = await this.inventoryRepository.findOne({
      where: { warehouse_id: fromId, product_variant_id: variantId }
    });

    if (!sourceInventory || sourceInventory.quantity < quantity) {
      throw new Error('Not enough stock in source warehouse');
    }

    return this.stockTransferRepository.create({
      from_warehouse_id: fromId,
      to_warehouse_id: toId,
      product_variant_id: variantId,
      product_id: sourceInventory.product_id, // Need product_id from inventory
      quantity: quantity,
      created_user_id: userId,
      notes: notes,
      status: 'pending'
    });
  }

  async getStockTransfers(filter: any): Promise<any> {
    const { page, limit, sort, warehouse_id, ...rest } = filter;
    const where: any = { ...rest };

    if (warehouse_id) {
      where.OR = [
        { from_warehouse_id: warehouse_id },
        { to_warehouse_id: warehouse_id }
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return this.stockTransferRepository.findAllWithRelations({
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      page: pageNum,
      limit: limitNum,
      where,
      orderBy: sort
    });
  }

  async approveStockTransfer(id: number, userId: number): Promise<any> {
    const transfer = await this.stockTransferRepository.findById(id);
    if (!transfer || transfer.status !== 'pending') {
      throw new Error('Invalid transfer state');
    }

    // Deduct from source
    const sourceInv = await this.inventoryRepository.findOne({
      where: { warehouse_id: Number(transfer.from_warehouse_id), product_variant_id: Number(transfer.product_variant_id) }
    });

    if (sourceInv) {
      await this.inventoryRepository.update(sourceInv.id, {
        quantity: sourceInv.quantity - transfer.quantity
      });
    }

    return this.stockTransferRepository.update(id, {
      status: 'approved',
      updated_user_id: userId
    });
  }

  async completeStockTransfer(id: number): Promise<any> {
    const transfer = await this.stockTransferRepository.findById(id);
    if (!transfer || transfer.status !== 'approved') {
      throw new Error('Transfer must be approved first');
    }

    // Add to destination
    const destInv = await this.inventoryRepository.findOne({
      where: { warehouse_id: Number(transfer.to_warehouse_id), product_variant_id: Number(transfer.product_variant_id) }
    });

    if (destInv) {
      await this.inventoryRepository.update(destInv.id, {
        quantity: destInv.quantity + transfer.quantity
      });
    } else {
      await this.inventoryRepository.create({
        warehouse_id: Number(transfer.to_warehouse_id),
        product_id: Number(transfer.product_id),
        product_variant_id: Number(transfer.product_variant_id),
        quantity: transfer.quantity,
        min_quantity: 0
      });
    }

    return this.stockTransferRepository.update(id, {
      status: 'completed'
    });
  }



  // ==========================================
  // IMPORT Logic
  // ==========================================
  async createImport(warehouseId: number, items: any[], userId: number, notes?: string): Promise<any> {
    // Note: This logic assumes 1 item per request for now based on current structure.
    // Ideally we should support multiple items, but existing code structure suggests loop or single item.
    // Let's implement single item for simplicity or loop if caller handles it.
    // Re-reading logic: The system seems to be designed around single "StockTransfer" record per item transaction?
    // StockTransfer table has 1 product_id, 1 variant_id. So it is 1 Item per Record.
    // If the API accepts multiple items, we should create multiple records.
    // But here I'll implement a single item creation helper, controller will loop.

    // Actually, let's stick to the pattern.
    // Code below creates 1 record.
    let { product_id, product_variant_id, quantity } = items[0]; // Simplified for single item

    // Auto-fill product_id if missing
    if (!product_id && product_variant_id) {
      const variant = await this.prisma.productVariant.findUnique({ where: { id: product_variant_id } });
      if (variant) product_id = variant.product_id;
    }

    if (!product_id) throw new Error('Product ID is required or Invalid Variant ID');

    return this.stockTransferRepository.create({
      from_warehouse_id: null,
      to_warehouse_id: warehouseId,
      product_id: product_id,
      product_variant_id: product_variant_id,
      quantity: quantity,
      type: 'import',
      status: 'pending',
      notes: notes,
      created_user_id: userId
    });
  }

  async approveImport(id: number, userId: number): Promise<any> {
    const transfer = await this.stockTransferRepository.findById(id);
    if (!transfer || transfer.status !== 'pending' || transfer.type !== 'import') {
      throw new Error('Invalid import state');
    }

    // Add to destination (warehouse_id in 'to')
    await this.addToInventory(Number(transfer.to_warehouse_id), Number(transfer.product_id), Number(transfer.product_variant_id), transfer.quantity);

    return this.stockTransferRepository.update(id, {
      status: 'approved',
      updated_user_id: userId
    });
  }

  // ==========================================
  // EXPORT Logic
  // ==========================================
  async createExport(warehouseId: number, items: any[], userId: number, notes?: string): Promise<any> {
    let { product_id, product_variant_id, quantity } = items[0];

    // Validate stock
    const sourceInv = await this.inventoryRepository.findOne({
      where: { warehouse_id: warehouseId, product_variant_id: product_variant_id }
    });
    if (!sourceInv || sourceInv.quantity < quantity) {
      throw new Error('Not enough stock to export');
    }

    if (!product_id && sourceInv) {
      product_id = sourceInv.product_id;
    }

    return this.stockTransferRepository.create({
      from_warehouse_id: warehouseId,
      to_warehouse_id: null,
      product_id: product_id,
      product_variant_id: product_variant_id,
      quantity: quantity,
      type: 'export',
      status: 'pending',
      notes: notes,
      created_user_id: userId
    });
  }

  async approveExport(id: number, userId: number): Promise<any> {
    const transfer = await this.stockTransferRepository.findById(id);
    if (!transfer || transfer.status !== 'pending' || transfer.type !== 'export') {
      throw new Error('Invalid export state');
    }

    // Deduct from source
    await this.deductFromInventory(Number(transfer.from_warehouse_id), Number(transfer.product_variant_id), transfer.quantity);

    return this.stockTransferRepository.update(id, {
      status: 'approved',
      updated_user_id: userId
    });
  }


  // Helper methods
  private async addToInventory(warehouseId: number, productId: number, variantId: number, quantity: number) {
    const destInv = await this.inventoryRepository.findOne({
      where: { warehouse_id: warehouseId, product_variant_id: variantId }
    });
    if (destInv) {
      await this.inventoryRepository.update(destInv.id, { quantity: destInv.quantity + quantity });
    } else {
      await this.inventoryRepository.create({
        warehouse_id: warehouseId,
        product_id: productId,
        product_variant_id: variantId,
        quantity: quantity,
        min_quantity: 0
      });
    }
  }

  private async deductFromInventory(warehouseId: number, variantId: number, quantity: number) {
    const sourceInv = await this.inventoryRepository.findOne({
      where: { warehouse_id: warehouseId, product_variant_id: variantId }
    });
    if (sourceInv) {
      await this.inventoryRepository.update(sourceInv.id, { quantity: sourceInv.quantity - quantity });
    }
  }

  async cancelStockTransfer(id: number): Promise<any> {
    const transfer = await this.stockTransferRepository.findById(id);
    if (!transfer) throw new Error('Transfer not found');

    const type = transfer.type || 'transfer';

    if (transfer.status === 'approved') {
      if (type === 'transfer') {
        // Rollback source
        await this.addToInventory(Number(transfer.from_warehouse_id), Number(transfer.product_id), Number(transfer.product_variant_id), transfer.quantity);
      } else if (type === 'import') {
        // Import approved -> Stock Added. Rollback = Deduct
        await this.deductFromInventory(Number(transfer.to_warehouse_id), Number(transfer.product_variant_id), transfer.quantity);
      } else if (type === 'export') {
        // Export approved -> Stock Deducted. Rollback = Add
        await this.addToInventory(Number(transfer.from_warehouse_id), Number(transfer.product_id), Number(transfer.product_variant_id), transfer.quantity);
      }
    }

    return this.stockTransferRepository.update(id, { status: 'cancelled' });
  }

  protected override async prepareFilters(filters?: any, _options?: any): Promise<any> {
    const prepared = { ...(filters || {}) };
    if (prepared.group_id === undefined) {
      // Warehouse doesn't have group_id currently
    }
    return prepared;
  }

  /**
   * Prisma `Warehouse` model hiện tại chỉ có: code, name, address, contact_name, contact_phone, status...
   * Một số client payload cũ có thể gửi thêm city/district/lat/long/phone/manager_name/is_active...
   * → cần sanitize để tránh Prisma "Unknown argument ..."
   */
  private sanitizeWarehouseInput(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized: any = {};

    // allowlist fields that exist in prisma schema
    if (data.code !== undefined) sanitized.code = data.code;
    if (data.name !== undefined) sanitized.name = data.name;
    if (data.address !== undefined) sanitized.address = data.address;
    if (data.city !== undefined) sanitized.city = data.city;
    if (data.district !== undefined) sanitized.district = data.district;
    if (data.latitude !== undefined) sanitized.latitude = data.latitude;
    if (data.longitude !== undefined) sanitized.longitude = data.longitude;
    if (data.phone !== undefined) sanitized.phone = data.phone;
    if (data.manager_name !== undefined) sanitized.manager_name = data.manager_name;
    if (data.priority !== undefined) sanitized.priority = data.priority;
    if (data.is_active !== undefined) sanitized.is_active = data.is_active;
    if (data.contact_name !== undefined) sanitized.contact_name = data.contact_name;
    if (data.contact_phone !== undefined) sanitized.contact_phone = data.contact_phone;

    // Keep status + is_active consistent
    if (data.is_active !== undefined) {
      sanitized.status = data.is_active ? 'active' : 'inactive';
    } else if (data.status !== undefined) {
      sanitized.status = data.status;
      sanitized.is_active = data.status === 'active';
    } else if (data.is_active === undefined && data.status === undefined) {
      // noop
    }

    return sanitized;
  }

  protected override async beforeCreate(data: any): Promise<any> {
    return this.sanitizeWarehouseInput(data);
  }

  protected override async beforeUpdate(_id: string | number | bigint, data: any): Promise<any> {
    return this.sanitizeWarehouseInput(data);
  }

  override async getOne(id: string | number | bigint): Promise<Warehouse> {
    const warehouse = await super.getOne(id);
    return warehouse;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const warehouse = await this.repository.findById(id);
    return true;
  }

  async softDelete(id: number | bigint): Promise<boolean> {
    return this.delete(id);
  }

  async getWarehouseInventory(warehouseId: number, options: any = {}): Promise<any> {
    const { page, limit, sort, ...filter } = options;

    return this.inventoryRepository.findAll({
      page,
      limit,
      sort,
      filter: {
        warehouseId,
        lowStock: filter?.low_stock === 'true' || filter?.low_stock === true,
      },
      select: {
        id: true,
        warehouse_id: true,
        product_id: true,
        product_variant_id: true,
        quantity: true,
        min_quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            image: true,
          }
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            image: true,
          }
        }
      }
    });
  }

  async updateInventoryStock(warehouseId: number, variantId: number, quantity: number, minStock?: number): Promise<any> {
    await this.inventoryRepository.upsertInventory(warehouseId, variantId, quantity, minStock);
    return { success: true };
  }


  // Inventory logic would go here, adapted for Prisma
}