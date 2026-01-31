import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedWarehouseInventory {
  private readonly logger = new Logger(SeedWarehouseInventory.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding warehouses & warehouse inventory...');

    // Get shop groups
    const shop1 = await this.prisma.group.findFirst({ where: { code: 'shop1' } });

    // 1) Warehouses
    const whShared = await this.prisma.warehouse.upsert({
      where: { code: 'WH_SHARED' },
      update: {},
      create: {
        name: 'Kho dùng chung hệ thống',
        code: 'WH_SHARED',
        address: 'Trung tâm Phân phối',
        city: 'TP. Hồ Chí Minh',
        status: 'active',
        group_id: null, // ✅ Shared
      } as any,
    });

    const whShop1 = await this.prisma.warehouse.upsert({
      where: { code: 'WH_SHOP1' },
      update: {},
      create: {
        name: 'Kho riêng Shop 1',
        code: 'WH_SHOP1',
        address: 'Quận 1, TP. HCM',
        city: 'TP. Hồ Chí Minh',
        status: 'active',
        group_id: shop1?.id, // ✅ Shop 1 only
      } as any,
    });

    // 2) Inventory
    const variants = await this.prisma.productVariant.findMany({
      include: { product: true },
    });

    if (variants.length === 0) {
      this.logger.warn('No product variants found. SeedEcommerce should run before this seeder.');
      return;
    }

    for (const v of variants) {
      // Tồn kho trong kho dùng chung (kế thừa group_id từ variant/product)
      await this.prisma.warehouseInventory.create({
        data: {
          warehouse_id: whShared.id,
          product_id: v.product_id,
          product_variant_id: v.id,
          quantity: 100,
          min_quantity: 10,
          group_id: (v as any).group_id, // ✅ Inherit
        } as any
      });

      // Nếu variant thuộc shop 1, tạo tồn kho trong kho của shop 1
      if (shop1 && Number((v as any).group_id) === Number(shop1.id)) {
        await this.prisma.warehouseInventory.create({
          data: {
            warehouse_id: whShop1.id,
            product_id: v.product_id,
            product_variant_id: v.id,
            quantity: 50,
            min_quantity: 5,
            group_id: shop1.id,
          } as any
        });
      }
    }

    this.logger.log(`Seeded 2 warehouses and inventory records`);
  }
}


