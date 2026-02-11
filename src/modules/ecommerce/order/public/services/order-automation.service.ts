import { Injectable, Inject } from '@nestjs/common';
import { Order } from '@prisma/client';
import { MailService } from '@/core/mail/mail.service';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/order.repository';
import { IOrderItemRepository, ORDER_ITEM_REPOSITORY } from '../../domain/order-item.repository';
import { EncryptionService } from '@/common/encryption/encryption.service';
import { IProductDigitalAssetRepository, PRODUCT_DIGITAL_ASSET_REPOSITORY } from '../../../product-digital-asset/domain/product-digital-asset.repository';
import { ContentTemplateExecutionService } from '@/modules/core/content-template/services/content-template-execution.service';

@Injectable()
export class OrderAutomationService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(ORDER_ITEM_REPOSITORY)
    private readonly orderItemRepository: IOrderItemRepository,
    @Inject(PRODUCT_DIGITAL_ASSET_REPOSITORY)
    private readonly assetRepository: IProductDigitalAssetRepository,
    private readonly mailService: MailService,
    private readonly encryptionService: EncryptionService,
    private readonly templateService: ContentTemplateExecutionService,
  ) { }

  /**
   * Xử lý hậu thanh toán cho đơn hàng digital/mixed
   */
  async processPostPayment(order: Order): Promise<void> {
    if (!order) return;

    // Sửa: Xử lý cả 'mixed' nếu hệ thống hỗ trợ, hoặc giữ nguyên 'digital' theo plan
    if ((order as any).order_type !== 'digital' && (order as any).order_type !== 'mixed') {
      // return; // Uncomment if strictly digital
    }

    await this.sendDigitalProducts(order);

    // Digital order: tự động delivered toàn bộ đơn
    if ((order as any).order_type === 'digital') {
      await this.orderRepository.update(order.id, {
        status: 'delivered',
        shipping_status: 'delivered',
        delivered_at: new Date(),
      } as any);
    }
  }

  /**
   * Gửi sản phẩm digital sau khi thanh toán thành công
   */
  private async sendDigitalProducts(order: Order): Promise<void> {
    // Lấy order items với product info
    const orderItems = await this.orderItemRepository.findMany({
      order_id: order.id,
    }, {
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    } as any);

    // Lọc chỉ sản phẩm digital
    const digitalItems = orderItems.filter(
      (item: any) => item.variant?.product?.is_digital === true || item.product?.is_digital === true,
    );

    if (digitalItems.length === 0) {
      return;
    }

    const digitalProductsInfo: any[] = [];

    for (const item of digitalItems) {
      // Lấy key từ kho
      const availableAssets = await this.assetRepository.findAvailableAssets(
        item.product_id,
        item.product_variant_id,
        item.quantity
      );

      if (availableAssets.length < item.quantity) {
        console.error(`Not enough digital assets for product ${item.product_name}. Required: ${item.quantity}, Available: ${availableAssets.length}`);
      }

      const assignedAssets = availableAssets.slice(0, item.quantity);
      if (assignedAssets.length > 0) {
        await this.assetRepository.markAsSold(
          assignedAssets.map((a: any) => a.id),
          item.id
        );

        digitalProductsInfo.push({
          product_name: item.product_name,
          variant_name: item.variant_name,
          keys: assignedAssets.map((a: any) => this.encryptionService.decrypt(a.content))
        });
      }
    }

    if (digitalProductsInfo.length === 0) return;

    // Execute template with simple formatted string
    try {
      const productsInfoStr = digitalProductsInfo.map(item => {
        const variantStr = item.variant_name ? ` (${item.variant_name})` : '';
        return `${item.product_name}${variantStr}:\n${item.keys.map((k: string) => `- ${k}`).join('\n')}`;
      }).join('\n\n');

      await this.templateService.execute('digital_order_delivery', {
        to: order.customer_email,
        variables: {
          customer_name: order.customer_name || order.customer_email,
          order_number: order.order_number,
          products_info: productsInfoStr,
        }
      });
    } catch (error) {
      console.error('Failed to send digital delivery email via template:', error);
    }
  }
}


