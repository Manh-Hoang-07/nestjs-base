import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedEcommerce {
  private readonly logger = new Logger(SeedEcommerce.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding ecommerce data (categories, products, variants, attributes, coupons, shipping, payment)...');

    // Get shop groups
    const shop1 = await this.prisma.group.findFirst({ where: { code: 'shop1' } });
    const shop2 = await this.prisma.group.findFirst({ where: { code: 'shop2' } });
    const shopIds = [shop1, shop2].filter((s): s is any => s !== null).map(s => s.id);

    // 1. Product Categories (Mixed Global & Shop-specific)
    const categoriesData = [
      { name: 'Điện thoại', group_id: null }, // Global
      { name: 'Laptop', group_id: null },    // Global
      { name: 'Phụ kiện', group_id: null },  // Global
      { name: 'Sách', group_id: shop1?.id }, // Shop 1 only
      { name: 'Đồ gia dụng', group_id: shop2?.id }, // Shop 2 only
      { name: 'Thời trang', group_id: null }, // Global
    ];

    for (const cat of categoriesData) {
      await this.prisma.productCategory.upsert({
        where: { slug: `cat-${this.slugify(cat.name)}` },
        update: {},
        create: {
          name: cat.name,
          slug: `cat-${this.slugify(cat.name)}`,
          status: 'active',
          group_id: cat.group_id,
        } as any,
      });
    }

    const allCategories = await this.prisma.productCategory.findMany();

    // 2. Product Attributes & Values (Global for simplicity)
    const colorAttr = await this.prisma.productAttribute.upsert({
      where: { code: 'color' },
      update: {},
      create: {
        name: 'Màu sắc',
        code: 'color',
        type: 'select',
        is_filterable: true,
        is_required: true,
      },
    });

    const capacityAttr = await this.prisma.productAttribute.upsert({
      where: { code: 'capacity' },
      update: {},
      create: {
        name: 'Dung lượng',
        code: 'capacity',
        type: 'select',
        is_filterable: true,
        is_required: true,
      },
    });

    await this.prisma.productAttributeValue.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, product_attribute_id: colorAttr.id, value: 'black', label: 'Đen' } as any
    });
    await this.prisma.productAttributeValue.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, product_attribute_id: colorAttr.id, value: 'white', label: 'Trắng' } as any
    });
    await this.prisma.productAttributeValue.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, product_attribute_id: capacityAttr.id, value: '64', label: '64 GB' } as any
    });
    await this.prisma.productAttributeValue.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, product_attribute_id: capacityAttr.id, value: '128', label: '128 GB' } as any
    });

    const allColorValues = await this.prisma.productAttributeValue.findMany({
      where: { product_attribute_id: colorAttr.id },
    });
    const allCapacityValues = await this.prisma.productAttributeValue.findMany({
      where: { product_attribute_id: capacityAttr.id },
    });

    // 3. Products + Variants (Assigned to Shops)
    const productsToCreate: any[] = [];

    for (let i = 1; i <= 20; i++) {
      const shopId = shopIds[i % shopIds.length]; // Alternate between shops
      const baseName = `Sản phẩm #${i} của ${shopId === shop1?.id ? 'Shop 1' : 'Shop 2'}`;
      const slug = `product-${i}-${Date.now()}`;
      const sku = `SKU-${1000 + i}`;

      const product = await this.prisma.product.create({
        data: {
          name: baseName,
          slug,
          sku,
          description: `Mô tả chi tiết cho ${baseName}`,
          short_description: `Mô tả ngắn cho ${baseName}`,
          status: 'active',
          is_featured: i % 7 === 0,
          is_variable: true,
          group_id: shopId, // ✅ Assigned to shop
        } as any,
      });

      // Gán category (chỉ chọn category global hoặc category của shop mình)
      const compatibleCategories = allCategories.filter(c => (c as any).group_id === null || (c as any).group_id === shopId);
      const cat = compatibleCategories[i % compatibleCategories.length];
      await this.prisma.productProductCategory.create({
        data: {
          product_id: product.id,
          product_category_id: cat.id,
        },
      });

      // Tạo variants
      for (let j = 0; j < 2; j++) {
        const color = allColorValues[j % allColorValues.length];
        const capacity = allCapacityValues[j % allCapacityValues.length];
        const variantSku = `${sku}-${color.id}-${capacity.id}-${j}`;

        const variant = await this.prisma.productVariant.create({
          data: {
            product_id: product.id,
            name: `${baseName} - ${color.label} - ${capacity.label}`,
            sku: variantSku,
            price: 1000000 + (j * 100000),
            stock_quantity: 50,
            is_active: true,
            group_id: shopId, // ✅ Inherit group_id
          } as any,
        });

        await this.prisma.productVariantAttribute.createMany({
          data: [
            { product_variant_id: variant.id, product_attribute_id: colorAttr.id, product_attribute_value_id: color.id },
            { product_variant_id: variant.id, product_attribute_id: capacityAttr.id, product_attribute_value_id: capacity.id },
          ],
        });
      }
    }

    // 4. Coupons (Shop-specific)
    if (shop1) {
      await this.prisma.coupon.create({
        data: {
          code: 'SHOP1_10',
          name: 'Shop 1 Welcome Discount',
          type: 'percent',
          value: 10,
          status: 'active',
          group_id: shop1.id, // ✅ Shop 1 only
        } as any,
      });
    }
    if (shop2) {
      await this.prisma.coupon.create({
        data: {
          code: 'SHOP2_FIXED',
          name: 'Shop 2 Fixed Discount',
          type: 'fixed_amount',
          value: 50000,
          status: 'active',
          group_id: shop2.id, // ✅ Shop 2 only
        } as any,
      });
    }

    // 5. Global Configs (No group_id as requested)
    await this.prisma.shippingMethod.upsert({
      where: { code: 'STANDARD' },
      update: {},
      create: { name: 'Giao hàng tiêu chuẩn', code: 'STANDARD', price: 30000, status: 'active' }
    });

    await this.prisma.paymentMethod.upsert({
      where: { code: 'COD' },
      update: {},
      create: { name: 'Thanh toán khi nhận hàng (COD)', code: 'COD', type: 'offline', status: 'active' }
    });

    this.logger.log('Ecommerce data seeding completed');
  }

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}


