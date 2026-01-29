import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedWarehouseInventory {
  private readonly logger = new Logger(SeedWarehouseInventory.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding warehouses & warehouse inventory...');

    // Production-safe: nếu đã có inventory thì skip
    const inventoryExists = await this.prisma.warehouseInventory.findFirst();
    if (inventoryExists) {
      this.logger.log('Warehouse inventory already exists, skip seeding (production-safe)');
      return;
    }

    // 1) Warehouses (upsert theo code)
    const whMain = await this.prisma.warehouse.upsert({
      where: { code: 'WH_MAIN' },
      update: {
        name: 'Kho trung tâm',
        address: 'TP. Hồ Chí Minh',
        city: 'TP. Hồ Chí Minh',
        district: '',
        latitude: 10.7769,
        longitude: 106.7009,
        phone: '0900000000',
        manager_name: 'Admin',
        priority: 0,
        is_active: true,
        status: 'active',
        contact_name: 'Kho trung tâm',
        contact_phone: '0900000000',
      },
      create: {
        name: 'Kho trung tâm',
        code: 'WH_MAIN',
        address: 'TP. Hồ Chí Minh',
        city: 'TP. Hồ Chí Minh',
        district: '',
        latitude: 10.7769,
        longitude: 106.7009,
        phone: '0900000000',
        manager_name: 'Admin',
        priority: 0,
        is_active: true,
        contact_name: 'Kho trung tâm',
        contact_phone: '0900000000',
        status: 'active',
      },
    });

    const whHn = await this.prisma.warehouse.upsert({
      where: { code: 'WH_HN' },
      update: {
        name: 'Kho Hà Nội',
        address: 'Hà Nội',
        city: 'Hà Nội',
        district: '',
        latitude: 21.0278,
        longitude: 105.8342,
        phone: '0911111111',
        manager_name: 'Admin',
        priority: 0,
        is_active: true,
        status: 'active',
        contact_name: 'Kho Hà Nội',
        contact_phone: '0911111111',
      },
      create: {
        name: 'Kho Hà Nội',
        code: 'WH_HN',
        address: 'Hà Nội',
        city: 'Hà Nội',
        district: '',
        latitude: 21.0278,
        longitude: 105.8342,
        phone: '0911111111',
        manager_name: 'Admin',
        priority: 0,
        is_active: true,
        contact_name: 'Kho Hà Nội',
        contact_phone: '0911111111',
        status: 'active',
      },
    });

    // 2) Inventory: ưu tiên tạo tồn theo biến thể để khớp luồng variant-stock
    const variants = await this.prisma.productVariant.findMany({
      include: { product: true },
    });

    if (variants.length === 0) {
      this.logger.warn('No product variants found. SeedEcommerce should run before this seeder.');
      return;
    }

    const inventoryData = variants
      .filter((v) => v.product?.is_digital !== true) // digital: không cần tồn kho vật lý
      .flatMap((v, idx) => {
        const baseQty = Number(v.stock_quantity ?? 0);
        const qtyMain = Math.max(0, baseQty);
        const qtyHn = Math.max(0, Math.floor(baseQty / 2));
        const minQty = 5 + (idx % 5);

        return [
          {
            warehouse_id: whMain.id,
            product_id: v.product_id,
            product_variant_id: v.id,
            quantity: qtyMain,
            min_quantity: minQty,
          },
          {
            warehouse_id: whHn.id,
            product_id: v.product_id,
            product_variant_id: v.id,
            quantity: qtyHn,
            min_quantity: minQty,
          },
        ];
      });

    await this.prisma.warehouseInventory.createMany({
      data: inventoryData as any,
      skipDuplicates: true,
    });

    this.logger.log(`Seeded ${2} warehouses and ${inventoryData.length} inventory rows`);
  }
}


