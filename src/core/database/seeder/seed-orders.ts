import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedOrders {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    if (await this.prisma.order.findFirst()) return;

    const [users, shippingMethods, paymentMethods, variants] = await Promise.all([
      this.prisma.user.findMany({ take: 20 }),
      this.prisma.shippingMethod.findMany({ where: { status: 'active' as any } }),
      this.prisma.paymentMethod.findMany({ where: { status: 'active' as any } }),
      this.prisma.productVariant.findMany({ include: { product: true } }),
    ]);

    if (!variants.length || !paymentMethods.length) return;

    const shipId = shippingMethods[0]?.id;
    const pick = <T,>(arr: T[], i: number): T => arr[i % arr.length];
    const defaultAddress = { address: '123 Demo St', city: 'Hanoi', country: 'Vietnam' };

    for (let i = 1; i <= 30; i++) {
      const user = users.length ? pick(users, i) : null;
      const variant = pick(variants, i);
      const isDigital = (variant.product as any).is_digital;
      const pm = pick(paymentMethods, i);

      const order = await this.prisma.order.create({
        data: {
          order_number: `ORD-${i}-${Date.now()}`,
          customer_name: user?.username ?? 'Guest',
          customer_email: user?.email ?? 'guest@example.com',
          customer_phone: '0123456789',
          order_type: isDigital ? 'digital' : 'physical',
          status: 'pending',
          subtotal: Number(variant.price),
          total_amount: Number(variant.price),
          shipping_address: defaultAddress,
          billing_address: defaultAddress,
          group_id: (variant as any).group_id,
          user: user ? { connect: { id: user.id } } : undefined,
          payment_method: { connect: { id: pm.id } },
          shipping_method: !isDigital && shipId ? { connect: { id: shipId } } : undefined,
        } as any,
      });

      await this.prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: variant.product_id,
          product_variant_id: variant.id,
          product_name: (variant.product as any).name,
          product_sku: variant.sku,
          quantity: 1,
          unit_price: Number(variant.price),
          total_price: Number(variant.price),
        } as any,
      });
    }
  }
}




