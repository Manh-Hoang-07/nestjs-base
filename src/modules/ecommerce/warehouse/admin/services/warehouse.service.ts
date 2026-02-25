import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Warehouse } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IWarehouseRepository, WAREHOUSE_REPOSITORY } from '../../domain/warehouse.repository';
import { IWarehouseInventoryRepository, WAREHOUSE_INVENTORY_REPOSITORY } from '../../domain/warehouse-inventory.repository';
import { IStockTransferRepository, STOCK_TRANSFER_REPOSITORY } from '../../domain/stock-transfer.repository';
import { IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '../../../product-variant/domain/product-variant.repository';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';

@Injectable()
export class AdminWarehouseService extends BaseService<Warehouse, IWarehouseRepository> {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    protected readonly warehouseRepository: IWarehouseRepository,
    @Inject(WAREHOUSE_INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IWarehouseInventoryRepository,
    @Inject(STOCK_TRANSFER_REPOSITORY)
    private readonly stockTransferRepository: IStockTransferRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
  ) {
    super(warehouseRepository);
    this.autoAddGroupId = true;
  }

  async syncVariantStock(variantId: number | bigint): Promise<void> {
    const inventories = await this.inventoryRepository.findMany({
      productVariantId: variantId
    });

    const totalQuantity = inventories.reduce((sum, inv) => sum + Number(inv.quantity), 0);

    await this.productVariantRepository.update(variantId, {
      stock_quantity: totalQuantity
    });
  }

  async findDefaultWarehouse(groupId: number | bigint | null): Promise<any> {
    return this.warehouseRepository.findOne({
      group_id: groupId,
      status: 'active'
    });
  }

  async createStockTransfer(fromId: number, toId: number, variantId: number, quantity: number, userId: number, notes?: string): Promise<any> {
    const sourceInventory = await this.inventoryRepository.findByWarehouseAndProduct(fromId, 0, variantId); // Assuming passing 0 for product_id as variantId is specific

    if (!sourceInventory || sourceInventory.quantity < quantity) {
      throw new Error('Not enough stock in source warehouse');
    }

    return this.stockTransferRepository.create({
      from_warehouse_id: fromId,
      to_warehouse_id: toId,
      product_variant_id: variantId,
      product_id: sourceInventory.product_id,
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

    return (this.stockTransferRepository as any).findAllWithRelations({
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      page: pageNum,
      limit: limitNum,
      where,
      orderBy: sort
    });
  }

  async getSimpleStockTransfers(filter: any): Promise<any> {
    return this.getStockTransfers({ ...filter, limit: filter.limit || 1000 });
  }

  async approveStockTransfer(id: number, userId: number): Promise<any> {
    const transfer = await this.stockTransferRepository.findById(id);
    if (!transfer || transfer.status !== 'pending') {
      throw new Error('Invalid transfer state');
    }

    // Deduct from source
    const sourceInv = await this.inventoryRepository.findByWarehouseAndProduct(
      Number(transfer.from_warehouse_id),
      0,
      Number(transfer.product_variant_id)
    );

    if (sourceInv) {
      await this.inventoryRepository.update(sourceInv.id, {
        quantity: Number(sourceInv.quantity) - Number(transfer.quantity)
      });
      await this.syncVariantStock(Number(transfer.product_variant_id));
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
    const destInv = await this.inventoryRepository.findByWarehouseAndProduct(
      Number(transfer.to_warehouse_id),
      0,
      Number(transfer.product_variant_id)
    );

    if (destInv) {
      await this.inventoryRepository.update(destInv.id, {
        quantity: Number(destInv.quantity) + Number(transfer.quantity)
      });
    } else {
      await this.inventoryRepository.create({
        warehouse_id: transfer.to_warehouse_id,
        product_id: transfer.product_id,
        product_variant_id: transfer.product_variant_id,
        quantity: transfer.quantity,
        min_quantity: 0
      });
    }

    await this.syncVariantStock(Number(transfer.product_variant_id));

    return this.stockTransferRepository.update(id, {
      status: 'completed'
    });
  }

  // ==========================================
  // IMPORT Logic
  // ==========================================
  async createImport(warehouseId: number, items: any[], userId: number, notes?: string): Promise<any> {
    let { product_id, product_variant_id, quantity } = items[0];

    // Auto-fill product_id if missing
    if (!product_id && product_variant_id) {
      const variant = await this.productVariantRepository.findById(product_variant_id);
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
    await this.addToInventory(Number(transfer.to_warehouse_id), Number(transfer.product_id), Number(transfer.product_variant_id), Number(transfer.quantity));
    await this.syncVariantStock(Number(transfer.product_variant_id));

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
    const sourceInv = await this.inventoryRepository.findByWarehouseAndProduct(warehouseId, 0, product_variant_id);
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
    await this.deductFromInventory(Number(transfer.from_warehouse_id), Number(transfer.product_variant_id), Number(transfer.quantity));
    await this.syncVariantStock(Number(transfer.product_variant_id));

    return this.stockTransferRepository.update(id, {
      status: 'approved',
      updated_user_id: userId
    });
  }

  // Helper methods
  private async addToInventory(warehouseId: number, productId: number, variantId: number, quantity: number) {
    const destInv = await this.inventoryRepository.findByWarehouseAndProduct(warehouseId, 0, variantId);
    if (destInv) {
      await this.inventoryRepository.update(destInv.id, { quantity: Number(destInv.quantity) + quantity });
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
    const sourceInv = await this.inventoryRepository.findByWarehouseAndProduct(warehouseId, 0, variantId);
    if (sourceInv) {
      await this.inventoryRepository.update(sourceInv.id, { quantity: Number(sourceInv.quantity) - quantity });
    }
  }

  async cancelStockTransfer(id: number): Promise<any> {
    const transfer = await this.stockTransferRepository.findById(id);
    if (!transfer) throw new Error('Transfer not found');

    const type = transfer.type || 'transfer';

    if (transfer.status === 'approved') {
      if (type === 'transfer') {
        // Rollback source
        await this.addToInventory(Number(transfer.from_warehouse_id), Number(transfer.product_id), Number(transfer.product_variant_id), Number(transfer.quantity));
      } else if (type === 'import') {
        // Import approved -> Stock Added. Rollback = Deduct
        await this.deductFromInventory(Number(transfer.to_warehouse_id), Number(transfer.product_variant_id), Number(transfer.quantity));
      } else if (type === 'export') {
        // Export approved -> Stock Deducted. Rollback = Add
        await this.addToInventory(Number(transfer.from_warehouse_id), Number(transfer.product_id), Number(transfer.product_variant_id), Number(transfer.quantity));
      }
    }

    await this.syncVariantStock(Number(transfer.product_variant_id));

    return this.stockTransferRepository.update(id, { status: 'cancelled' });
  }

  protected override async prepareFilters(filters?: any, _options?: any): Promise<any> {
    const prepared = { ...(filters || {}) };
    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const groupId = RequestContext.get<number | null>('groupId');
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = groupId;
      }
    }
    return prepared;
  }

  private sanitizeWarehouseInput(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized: any = {};

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

    if (data.group_id !== undefined) sanitized.group_id = data.group_id;

    // Không tự động gán group_id ở đây nữa vì đã handle trong beforeCreate

    if (data.is_active !== undefined) {
      sanitized.status = data.is_active ? 'active' : 'inactive';
    } else if (data.status !== undefined) {
      sanitized.status = data.status;
      sanitized.is_active = data.status === 'active';
    }

    return sanitized;
  }

  protected override async beforeCreate(data: any): Promise<any> {
    // Gọi super để tự động thêm group_id
    const payload = await super.beforeCreate(data);
    return this.sanitizeWarehouseInput(payload);
  }

  protected override async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException(`Warehouse with ID ${id} not found`);
    verifyGroupOwnership(entity as any);
    return this.sanitizeWarehouseInput(data);
  }

  override async getOne(id: string | number | bigint): Promise<Warehouse> {
    const warehouse = await super.getOne(id);
    verifyGroupOwnership(warehouse as any);
    return warehouse;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const warehouse = await this.repository.findById(id);
    if (warehouse) {
      verifyGroupOwnership(warehouse as any);
    }
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
    } as any);
  }

  async updateInventoryStock(warehouseId: number, variantId: number, quantity: number, minStock?: number): Promise<any> {
    await this.inventoryRepository.upsertInventory(warehouseId, variantId, quantity, minStock);
    await this.syncVariantStock(variantId);
    return { success: true };
  }
}

