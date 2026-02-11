import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { TrackingHistory, Order } from '@prisma/client';
import { ShippingStatus } from '@/shared/enums';
import { ITrackingHistoryRepository, TRACKING_HISTORY_REPOSITORY } from '../../domain/tracking-history.repository';
import { IOrderRepository, ORDER_REPOSITORY } from '@/modules/ecommerce/order/domain/order.repository';
import { ShippingProviderService } from './shipping-provider.service';

@Injectable()
export class TrackingService {
  constructor(
    @Inject(TRACKING_HISTORY_REPOSITORY)
    private readonly trackingHistoryRepository: ITrackingHistoryRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly shippingProviderService: ShippingProviderService,
  ) { }

  /**
   * Create shipment with provider
   */
  async createShipment(orderId: number | bigint, providerName: string = 'ghn'): Promise<any> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Need to load items manually or ensure repository handles it if needed by provider
    // Ideally order repository should have a method to get order with items, or we use include in findById if supported
    // For now assuming order object has items if it was fetched with proper relations or we fetch them deeply.
    // However, base repository findById might not include relation 'items' by default.
    // We might need a specific method in OrderRepository or use findOne with specific options if base allows.
    // Let's assume for now provider works or we might fail if items are missing.
    // WORKAROUND: Cast order to any to access items if they are loaded.
    // If not loaded, we might need to enhance OrderRepository.

    // Get shipping provider
    const provider = this.shippingProviderService.getProvider(providerName);

    // Create shipment
    const result = await provider.createShipment(order);

    if (result.success) {
      // Update order
      await this.orderRepository.update(orderId, {
        tracking_number: result.trackingNumber,
        shipping_status: ShippingStatus.processing // Equivalent to 'pending_pickup' logic potentially
      });

      // Create tracking history
      await this.addTrackingHistory({
        order_id: BigInt(orderId),
        status: 'pending_pickup',
        description: `Đơn hàng đã được tạo và chờ lấy hàng [${providerName}]`,
      });
    }

    return result;
  }

  /**
   * Get tracking information from provider
   */
  async getTracking(trackingNumber: string, providerName: string = 'ghn'): Promise<any> {
    // We need to find order by tracking number
    // OrderRepository needs findByTrackingNumber or we use findAll with filter
    const orders = await this.orderRepository.findAll({ filter: { search: trackingNumber } });
    const order = orders.data.find(o => o.tracking_number === trackingNumber);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const provider = this.shippingProviderService.getProvider(providerName);
    const trackingInfo = await provider.getTracking(trackingNumber);

    // Update local tracking history
    for (const event of trackingInfo.history) {
      await this.addTrackingHistory({
        order_id: order.id,
        status: event.status,
        location: event.location,
        description: event.description,
        raw_data: event as any // Store full event as json
      });
    }

    return trackingInfo;
  }

  /**
   * Add tracking history event
   */
  async addTrackingHistory(data: Partial<TrackingHistory>): Promise<TrackingHistory> {
    // Check if event already exists to avoid duplicates
    // Using explicit where clause via findAll since generic findOne might differ
    // Or extend repository to support findOne with criteria.
    // Using simplified check:
    const existingList = await this.trackingHistoryRepository.findAll({
      filter: { orderId: data.order_id }
    });

    // In-memory check for duplicate status/description equality to avoid spam
    const existing = existingList.data.find(h => h.status === data.status && h.description === data.description);

    if (existing) {
      return existing;
    }

    return this.trackingHistoryRepository.create(data);
  }

  /**
   * Get tracking history for order
   */
  async getTrackingHistory(orderId: number): Promise<TrackingHistory[]> {
    const result = await this.trackingHistoryRepository.findByOrderId(orderId);
    return result;
  }

  /**
   * Get tracking history by order tracking number
   */
  async getTrackingHistoryByNumber(trackingNumber: string): Promise<TrackingHistory[]> {
    const orders = await this.orderRepository.findAll({ filter: { search: trackingNumber } });
    const order = orders.data.find(o => o.tracking_number === trackingNumber);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.getTrackingHistory(Number(order.id));
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(orderId: number, providerName: string = 'ghn'): Promise<boolean> {
    const order = await this.orderRepository.findById(orderId);

    if (!order || !order.tracking_number) {
      throw new NotFoundException('Order or tracking number not found');
    }

    const provider = this.shippingProviderService.getProvider(providerName);
    const result = await provider.cancelShipment(order.tracking_number);

    if (result) {
      // Add cancellation to tracking history
      // Add cancellation to tracking history
      await this.addTrackingHistory({
        order_id: BigInt(orderId),
        status: 'cancelled',
        description: `Đơn hàng đã bị hủy [${providerName}]`,
      });

      // Update order status
      await this.orderRepository.update(orderId, {
        shipping_status: ShippingStatus.cancelled
      });
    }

    return result;
  }

  /**
   * Handle webhook from shipping provider
   */
  async handleWebhook(providerName: string, payload: any): Promise<void> {
    const provider = this.shippingProviderService.getProvider(providerName);
    await provider.handleWebhook(payload);
  }
}

