import { Injectable } from '@nestjs/common';
import { Order, OrderItem } from '@prisma/client';
import { MailService } from '@/core/mail/mail.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class OrderAutomationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  /**
   * Xử lý hậu thanh toán cho đơn hàng digital/mixed
   */
  async processPostPayment(order: Order): Promise<void> {
    if (!order) return;

    if (order.order_type !== 'digital' && order.order_type !== 'mixed') {
      return;
    }

    await this.sendDigitalProducts(order);

    // Digital order: tự động delivered toàn bộ đơn
    if (order.order_type === 'digital') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'delivered',
          shipping_status: 'delivered',
          delivered_at: new Date(),
        },
      });
    }
  }

  /**
   * Gửi sản phẩm digital sau khi thanh toán thành công
   */
  private async sendDigitalProducts(order: Order): Promise<void> {
    // Lấy order items với product info
    const orderItems = await this.prisma.orderItem.findMany({
      where: { order_id: order.id },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    // Lọc chỉ sản phẩm digital
    const digitalItems = orderItems.filter(
      (item: any) => item.variant?.product?.is_digital === true,
    );

    if (digitalItems.length === 0) {
      return;
    }

    // Chuẩn bị dữ liệu để gửi
    const digitalProducts = digitalItems.map((item: any) => ({
      product_name: item.product_name,
      variant_name: item.variant_name,
    }));

    const subject = `[Order #${order.order_number}] Thông tin sản phẩm digital của bạn`;

    const htmlLines: string[] = [];
    htmlLines.push(
      `<p>Xin chào ${order.customer_name || order.customer_email},</p>`,
    );
    htmlLines.push(
      `<p>Cảm ơn bạn đã mua hàng! Đơn hàng <strong>#${order.order_number}</strong> đã được thanh toán thành công.</p>`,
    );
    htmlLines.push('<p>Thông tin sản phẩm digital của bạn:</p>');
    htmlLines.push('<ul>');
    for (const item of digitalProducts) {
      htmlLines.push(
        `<li><strong>${item.product_name}</strong> - ${item.variant_name}</li>`,
      );
    }
    htmlLines.push('</ul>');
    htmlLines.push(
      '<p>Nếu bạn không thực hiện giao dịch này hoặc có bất kỳ thắc mắc nào, vui lòng liên hệ lại với chúng tôi.</p>',
    );
    htmlLines.push('<p>Trân trọng,<br/>Hệ thống ecommerce</p>');

    await this.mailService.send({
      to: order.customer_email,
      subject,
      html: htmlLines.join(''),
    });
  }
}
