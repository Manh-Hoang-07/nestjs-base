import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedWarehouseInventory {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'ecommerce');
    const warehousesData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'warehouses.json'), 'utf8'));

    const warehouseMap = new Map<string, any>();
    for (const data of warehousesData) {
      const group = data.group_code ? await this.prisma.group.findFirst({ where: { code: data.group_code } }) : null;
      const wh = await this.prisma.warehouse.upsert({
        where: { code: data.code }, update: {}, create: { ...data, group_code: undefined, group_id: group?.id } as any,
      });
      warehouseMap.set(wh.code, wh);
    }

    const variants = await this.prisma.productVariant.findMany();
    if (variants.length === 0) return;

    const whShared = warehouseMap.get('WH_SHARED');
    const whShop1 = warehouseMap.get('WH_SHOP1');
    const shop1 = await this.prisma.group.findFirst({ where: { code: 'shop1' } });

    for (const v of variants) {
      if (whShared) {
        await this.prisma.warehouseInventory.upsert({
          where: { warehouse_id_product_id_product_variant_id: { warehouse_id: whShared.id, product_id: v.product_id, product_variant_id: v.id } },
          update: {}, create: { warehouse_id: whShared.id, product_id: v.product_id, product_variant_id: v.id, quantity: 100, min_quantity: 10, group_id: (v as any).group_id } as any,
        });
      }
      if (whShop1 && shop1 && Number((v as any).group_id) === Number(shop1.id)) {
        await this.prisma.warehouseInventory.upsert({
          where: { warehouse_id_product_id_product_variant_id: { warehouse_id: whShop1.id, product_id: v.product_id, product_variant_id: v.id } },
          update: {}, create: { warehouse_id: whShop1.id, product_id: v.product_id, product_variant_id: v.id, quantity: 50, min_quantity: 5, group_id: shop1.id } as any,
        });
      }
    }
  }

  async clear(): Promise<void> {
    await this.prisma.warehouseInventory.deleteMany({});
    await this.prisma.warehouse.deleteMany({});
  }
}
