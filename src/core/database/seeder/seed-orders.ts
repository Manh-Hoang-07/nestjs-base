import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedOrders {
  private readonly logger = new Logger(SeedOrders.name);

  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding orders (orders, items, payments, tracking)...');

    // Production-safe: nếu đã có orders thì skip
    const orderExists = await this.prisma.order.findFirst();
    if (orderExists) {
      this.logger.log('Orders already exist, skip seeding (production-safe)');
      return;
    }

    const [users, shippingMethods, paymentMethods, variants] = await Promise.all([
      this.prisma.user.findMany({ take: 20 }),
      this.prisma.shippingMethod.findMany({ where: { status: 'active' as any } }),
      this.prisma.paymentMethod.findMany({ where: { status: 'active' as any } }),
      this.prisma.productVariant.findMany({
        include: { product: true, attributes: { include: { attribute_value: true } } },
        take: 200,
      }),
    ]);

    if (variants.length === 0) {
      this.logger.warn('No product variants found. SeedEcommerce should run before this seeder.');
      return;
    }
    if (paymentMethods.length === 0) {
      this.logger.warn('No payment methods found. SeedEcommerce should run before this seeder.');
      return;
    }

    const shippingMethodId = shippingMethods[0]?.id ?? null;

    const digitalVariants = variants.filter((v: any) => v.product?.is_digital === true);
    const physicalVariants = variants.filter((v: any) => v.product?.is_digital !== true);

    const pick = <T,>(arr: T[], idx: number): T => arr[idx % arr.length];

    const buildAddress = (seed: number) => ({
      name: `Khách hàng #${seed}`,
      phone: `09${String(10000000 + seed).slice(0, 8)}`,
      email: `customer${seed}@example.com`,
      address_line_1: `${seed} Nguyễn Văn A`,
      ward: 'Phường 1',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      country: 'VN',
      postal_code: '700000',
    });

    const makeOrderNumber = (i: number) => `SEED-ORD-${String(i).padStart(5, '0')}`;

    const now = Date.now();
    const ordersToCreate = 30;

    for (let i = 1; i <= ordersToCreate; i++) {
      const orderNumber = makeOrderNumber(i);
      const user = users.length ? pick(users, i) : null;

      const isDigitalOrder = i % 6 === 0 && digitalVariants.length > 0;
      const variantPool = isDigitalOrder ? digitalVariants : physicalVariants.length ? physicalVariants : variants;
      const firstVariant: any = pick(variantPool, i * 7);
      const orderGroupId = firstVariant.group_id;

      const itemCount = 1 + (i % 3);
      const items: any[] = [];

      let subtotal = 0;
      for (let j = 0; j < itemCount; j++) {
        const v: any = pick(variantPool, i * 7 + j);
        const qty = 1 + ((i + j) % 2);
        const unitPrice = Number(v.sale_price ?? v.price ?? 0);
        const totalPrice = unitPrice * qty;
        subtotal += totalPrice;

        const attrs =
          Array.isArray(v.attributes) && v.attributes.length
            ? v.attributes.map((a: any) => ({
              attribute_id: a.product_attribute_id,
              value_id: a.product_attribute_value_id,
              label: a.attribute_value?.label,
              value: a.attribute_value?.value,
            }))
            : null;

        items.push({
          product_id: v.product_id,
          product_variant_id: v.id,
          product_name: v.product?.name ?? `Product #${String(v.product_id)}`,
          product_sku: v.product?.sku ?? `SKU-${String(v.product_id)}`,
          variant_name: v.name ?? null,
          quantity: qty,
          unit_price: unitPrice,
          total_price: totalPrice,
          product_attributes: attrs as any,
        });
      }

      const shippingAmount = isDigitalOrder ? 0 : 30000;
      const discountAmount = i % 10 === 0 ? 50000 : 0;
      const totalAmount = Math.max(0, subtotal + shippingAmount - discountAmount);

      const paymentMethod = pick(paymentMethods, i);
      const isOnline = paymentMethod.type === 'online';
      const paymentStatus = isOnline && i % 2 === 0 ? 'completed' : 'pending';

      const address = buildAddress(i);
      const createdAt = new Date(now - i * 24 * 60 * 60 * 1000);

      const order = await this.prisma.order.create({
        data: {
          order_number: orderNumber,
          session_token: user ? null : `seed-session-${orderNumber}`,
          customer_name: user?.name ?? address.name,
          customer_email: user?.email ?? address.email,
          customer_phone: user?.phone ?? address.phone,
          shipping_address: address as any,
          billing_address: address as any,
          order_type: isDigitalOrder ? 'digital' : 'physical',
          status: isDigitalOrder && paymentStatus === 'completed' ? 'delivered' : 'pending',
          payment_status: paymentStatus as any,
          shipping_status: isDigitalOrder ? 'delivered' : 'pending',
          subtotal,
          tax_amount: 0,
          shipping_amount: shippingAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          currency: 'VND',
          group_id: orderGroupId, // ✅ Inherit group_id từ sản phẩm đầu tiên
          notes: i % 5 === 0 ? 'Ghi chú đơn hàng seed' : null,
          created_at: createdAt as any,
          updated_at: createdAt as any,
          user: user ? { connect: { id: user.id } } : undefined,
          shipping_method: isDigitalOrder || !shippingMethodId ? undefined : { connect: { id: shippingMethodId } },
          payment_method: { connect: { id: paymentMethod.id } },
        } as any,
      });

      await this.prisma.orderItem.createMany({
        data: items.map((it) => ({ ...it, order_id: order.id })) as any,
      });

      await this.prisma.payment.create({
        data: {
          order_id: order.id,
          payment_method_id: paymentMethod.id,
          amount: totalAmount,
          status: paymentStatus as any,
          payment_method_type: paymentMethod.type as any,
          transaction_id: isOnline && paymentStatus === 'completed' ? `SEED-TXN-${orderNumber}` : null,
          payment_method_code: paymentMethod.code,
          paid_at: paymentStatus === 'completed' ? createdAt : null,
          notes: 'Seed payment',
          created_at: createdAt as any,
          updated_at: createdAt as any,
        } as any,
      });

      if (!isDigitalOrder) {
        // Tạo tracking history giả lập cho một phần đơn hàng
        if (i % 3 === 0) {
          await this.prisma.trackingHistory.createMany({
            data: [
              {
                order_id: order.id,
                status: 'confirmed',
                description: 'Đơn hàng đã được xác nhận',
                location: 'Hệ thống',
                raw_data: { seed: true },
                created_at: createdAt as any,
              },
              {
                order_id: order.id,
                status: 'shipped',
                description: 'Đơn hàng đã được bàn giao cho đơn vị vận chuyển',
                location: 'Kho trung tâm',
                raw_data: { seed: true },
                created_at: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) as any,
              },
            ] as any,
            skipDuplicates: true,
          });
        }
      }
    }

    this.logger.log(`Seeded ${ordersToCreate} orders successfully`);
  }
}


