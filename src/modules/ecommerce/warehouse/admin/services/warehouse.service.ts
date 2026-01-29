import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Warehouse } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IWarehouseRepository, WAREHOUSE_REPOSITORY } from '../../domain/warehouse.repository';
import { IWarehouseInventoryRepository, WAREHOUSE_INVENTORY_REPOSITORY } from '../../domain/warehouse-inventory.repository';
import { RequestContext } from '@/common/shared/utils/request-context.util';

@Injectable()
export class AdminWarehouseService extends BaseService<Warehouse, IWarehouseRepository> {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    protected readonly warehouseRepository: IWarehouseRepository,
    @Inject(WAREHOUSE_INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IWarehouseInventoryRepository,
  ) {
    super(warehouseRepository);
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

  async createStockTransfer(fromId: number, toId: number, variantId: number, quantity: number, userId: number, notes?: string): Promise<any> {
    // Placeholder implementation
    return { success: true };
  }

  async getStockTransfers(filter: any): Promise<any> {
    // Placeholder implementation
    return [];
  }

  async approveStockTransfer(id: number, userId: number): Promise<any> {
    // Placeholder implementation
    return { success: true };
  }

  async completeStockTransfer(id: number): Promise<any> {
    // Placeholder implementation
    return { success: true };
  }

  async cancelStockTransfer(id: number): Promise<any> {
    // Placeholder implementation
    return { success: true };
  }

  // Inventory logic would go here, adapted for Prisma
}