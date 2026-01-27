import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedEcommerce {
  private readonly logger = new Logger(SeedEcommerce.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding ecommerce data (categories, products, variants, attributes, coupons, shipping, payment)...');

    // 1. Product Categories
    const categoriesData = [
      'Điện thoại',
      'Laptop',
      'Phụ kiện',
      'Đồng hồ',
      'Tai nghe',
      'Thiết bị mạng',
    ].map((name, idx) => ({
      name,
      slug: `cat-${idx + 1}-${this.slugify(name)}`,
      status: 'active' as const,
    }));

    const categories = await this.prisma.productCategory.createMany({
      data: categoriesData,
      skipDuplicates: true,
    });

    // Lấy lại categories để có id
    const allCategories = await this.prisma.productCategory.findMany();

    // 2. Product Attributes & Values (ví dụ: Màu sắc, Dung lượng)
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

    const colorValues = await this.prisma.productAttributeValue.createMany({
      data: [
        { product_attribute_id: colorAttr.id, value: 'black', label: 'Đen' },
        { product_attribute_id: colorAttr.id, value: 'white', label: 'Trắng' },
        { product_attribute_id: colorAttr.id, value: 'blue', label: 'Xanh dương' },
        { product_attribute_id: colorAttr.id, value: 'red', label: 'Đỏ' },
      ],
      skipDuplicates: true,
    });

    const capacityValues = await this.prisma.productAttributeValue.createMany({
      data: [
        { product_attribute_id: capacityAttr.id, value: '64', label: '64 GB' },
        { product_attribute_id: capacityAttr.id, value: '128', label: '128 GB' },
        { product_attribute_id: capacityAttr.id, value: '256', label: '256 GB' },
      ],
      skipDuplicates: true,
    });

    const allColorValues = await this.prisma.productAttributeValue.findMany({
      where: { product_attribute_id: colorAttr.id },
    });
    const allCapacityValues = await this.prisma.productAttributeValue.findMany({
      where: { product_attribute_id: capacityAttr.id },
    });

    // 3. Products + Variants
    const productsToCreate: any[] = [];
    const variantsToCreate: any[] = [];
    const productCategoryLinks: any[] = [];
    const variantAttributesToCreate: any[] = [];

    for (let i = 1; i <= 50; i++) {
      const baseName = `Sản phẩm #${i}`;
      const slug = `product-${i}`;
      const sku = `SKU-${1000 + i}`;

      const category = allCategories[i % allCategories.length];

      const isDigital = i % 10 === 0; // mỗi 10 sp có 1 sp digital

      productsToCreate.push({
        name: baseName,
        slug,
        sku,
        description: `Mô tả chi tiết cho ${baseName}`,
        short_description: `Mô tả ngắn cho ${baseName}`,
        status: 'active' as const,
        is_featured: i % 7 === 0,
        is_variable: true,
        is_digital: isDigital,
      });
    }

    const createdProducts = await this.prisma.product.createMany({
      data: productsToCreate,
      skipDuplicates: true,
    });

    const allProducts = await this.prisma.product.findMany();

    for (const product of allProducts) {
      // Gán vào 1 category bất kỳ
      const cat = allCategories[Number(product.id) % allCategories.length];
      productCategoryLinks.push({
        product_id: product.id,
        product_category_id: cat.id,
      });

      // Tạo 2–3 variants / product
      const productColorValues = allColorValues.slice(0, 3);
      const productCapacityValues = allCapacityValues.slice(0, 2);

      let variantIndex = 0;
      for (const color of productColorValues) {
        for (const capacity of productCapacityValues) {
          variantIndex++;
          const variantSku = `${product.sku}-${color.value.toUpperCase()}-${capacity.value}`;

          const basePrice = 1000000 + (Number(product.id) % 10) * 100000;

          variantsToCreate.push({
            product_id: product.id,
            name: `${product.name} - ${color.label} - ${capacity.label}`,
            sku: variantSku,
            price: basePrice,
            sale_price: variantIndex % 2 === 0 ? basePrice * 0.9 : null,
            stock_quantity: product.is_digital ? 999999 : 20 + (variantIndex * 5),
            is_active: true,
          });
        }
      }
    }

    await this.prisma.productProductCategory.createMany({
      data: productCategoryLinks,
      skipDuplicates: true,
    });

    await this.prisma.productVariant.createMany({
      data: variantsToCreate,
      skipDuplicates: true,
    });

    const allVariants = await this.prisma.productVariant.findMany();

    // Gán attribute value cho variant (mỗi variant: 1 màu + 1 dung lượng)
    for (const variant of allVariants) {
      const color = allColorValues[Number(variant.id) % allColorValues.length];
      const capacity = allCapacityValues[Number(variant.id) % allCapacityValues.length];

      variantAttributesToCreate.push({
        product_variant_id: variant.id,
        product_attribute_id: colorAttr.id,
        product_attribute_value_id: color.id,
      });

      variantAttributesToCreate.push({
        product_variant_id: variant.id,
        product_attribute_id: capacityAttr.id,
        product_attribute_value_id: capacity.id,
      });
    }

    await this.prisma.productVariantAttribute.createMany({
      data: variantAttributesToCreate,
      skipDuplicates: true,
    });

    // 4. Coupons
    await this.prisma.coupon.createMany({
      data: [
        {
          code: 'WELCOME10',
          name: 'Giảm 10% cho đơn đầu tiên',
          description: 'Áp dụng cho tất cả sản phẩm, tối đa 200.000đ',
          type: 'percent',
          value: 10,
          min_order_value: 0,
          max_discount: 200000,
          status: 'active',
        } as any,
        {
          code: 'SALE100K',
          name: 'Giảm 100.000đ',
          description: 'Đơn tối thiểu 500.000đ',
          type: 'fixed_amount',
          value: 100000,
          min_order_value: 500000,
          status: 'active',
        } as any,
      ],
      skipDuplicates: true,
    });

    // 5. Shipping methods
    await this.prisma.shippingMethod.createMany({
      data: [
        {
          name: 'Giao hàng tiêu chuẩn',
          code: 'STANDARD',
          description: 'Giao hàng từ 3-5 ngày làm việc',
          price: 30000,
          status: 'active',
        } as any,
        {
          name: 'Giao hàng nhanh',
          code: 'EXPRESS',
          description: 'Giao hàng trong 24-48h',
          price: 60000,
          status: 'active',
        } as any,
      ],
      skipDuplicates: true,
    });

    // 6. Payment methods (COD & VNPAY)
    await this.prisma.paymentMethod.createMany({
      data: [
        {
          name: 'Thanh toán khi nhận hàng (COD)',
          code: 'COD',
          description: 'Thanh toán tiền mặt khi nhận hàng',
          type: 'offline',
          status: 'active',
        } as any,
        {
          name: 'Thanh toán qua VNPay',
          code: 'VNPAY',
          description: 'Thanh toán trực tuyến qua cổng VNPay',
          type: 'online',
          status: 'active',
        } as any,
      ],
      skipDuplicates: true,
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


