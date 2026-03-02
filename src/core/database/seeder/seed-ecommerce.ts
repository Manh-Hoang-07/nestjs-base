import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedEcommerce {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'ecommerce');
    const config: any = JSON.parse(fs.readFileSync(path.join(baseDir, 'ecommerce-config.json'), 'utf8'));

    for (const cat of config.product_categories) {
      const group = cat.group_code ? await this.prisma.group.findFirst({ where: { code: cat.group_code } }) : null;
      const slug = `cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}`;
      await this.prisma.productCategory.upsert({
        where: { slug },
        update: {},
        create: { name: cat.name, slug, status: 'active', group_id: group?.id } as any,
      });
    }

    const attrMap = new Map<string, any>();
    for (const attrData of config.product_attributes) {
      const attr = await this.prisma.productAttribute.upsert({
        where: { code: attrData.code },
        update: {},
        create: { ...attrData, values: undefined },
      });
      attrMap.set(attr.code, attr);
      for (const valData of attrData.values) {
        if (!await this.prisma.productAttributeValue.findFirst({ where: { product_attribute_id: attr.id, value: valData.value } })) {
          await this.prisma.productAttributeValue.create({ data: { product_attribute_id: attr.id, ...valData } as any });
        }
      }
    }

    const colorAttr = attrMap.get('color');
    const capacityAttr = attrMap.get('capacity');
    const allColorValues = colorAttr ? await this.prisma.productAttributeValue.findMany({ where: { product_attribute_id: colorAttr.id } }) : [];
    const allCapacityValues = capacityAttr ? await this.prisma.productAttributeValue.findMany({ where: { product_attribute_id: capacityAttr.id } }) : [];

    const shopIds = (await this.prisma.group.findMany({ where: { code: { in: ['shop1', 'shop2'] } } })).map(s => s.id);
    const allCategories = await this.prisma.productCategory.findMany();

    for (let i = 1; i <= 20; i++) {
      const shopId = shopIds[i % shopIds.length];
      const baseName = `Sản phẩm #${i}`;
      const sku = `SKU-${1000 + i}`;

      let product = await this.prisma.product.findUnique({ where: { sku } });
      if (!product) {
        product = await this.prisma.product.create({
          data: {
            name: baseName, slug: `${sku.toLowerCase()}-${Date.now()}`, sku,
            status: 'active', is_featured: i % 7 === 0, is_variable: true, group_id: shopId,
          } as any,
        });
      }

      const cat = allCategories.find(c => !(c as any).group_id || Number((c as any).group_id) === Number(shopId));
      if (cat) {
        await this.prisma.productProductCategory.upsert({
          where: { product_id_product_category_id: { product_id: product.id, product_category_id: cat.id } },
          update: {}, create: { product_id: product.id, product_category_id: cat.id },
        });
      }

      for (let j = 0; j < 2; j++) {
        const color = allColorValues[j % allColorValues.length];
        const capacity = allCapacityValues[j % allCapacityValues.length];
        const vSku = `${sku}-v${j}`;
        if (!await this.prisma.productVariant.findUnique({ where: { sku: vSku } })) {
          const variant = await this.prisma.productVariant.create({
            data: { product_id: product.id, name: `${baseName}-v${j}`, sku: vSku, price: 1000000, stock_quantity: 50, is_active: true, group_id: shopId } as any,
          });
          if (color && capacity) {
            await this.prisma.productVariantAttribute.createMany({
              data: [
                { product_variant_id: variant.id, product_attribute_id: colorAttr.id, product_attribute_value_id: color.id },
                { product_variant_id: variant.id, product_attribute_id: capacityAttr.id, product_attribute_value_id: capacity.id },
              ],
            });
          }
        }
      }
    }

    for (const data of config.coupons) {
      const group = data.group_code ? await this.prisma.group.findFirst({ where: { code: data.group_code } }) : null;
      await this.prisma.coupon.upsert({
        where: { code: data.code }, update: {}, create: { ...data, group_code: undefined, group_id: group?.id } as any,
      });
    }

    for (const sm of config.shipping_methods) {
      await this.prisma.shippingMethod.upsert({ where: { code: sm.code }, update: {}, create: sm });
    }

    for (const pm of config.payment_methods) {
      await this.prisma.paymentMethod.upsert({ where: { code: pm.code }, update: {}, create: pm });
    }
  }
}
