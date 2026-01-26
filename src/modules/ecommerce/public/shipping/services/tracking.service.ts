import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingHistory } from '@/shared/entities/tracking-history.entity';
import { Order } from '@/shared/entities/order.entity';
import { ShippingProviderService } from './shipping-provider.service';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingHistory)
    private readonly trackingHistoryRepository: Repository<TrackingHistory>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly shippingProviderService: ShippingProviderService,
  ) {}

  /**
   * Create shipment with provider
   */
  async createShipment(orderId: number, providerName: string = 'ghn'): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get shipping provider
    const provider = this.shippingProviderService.getProvider(providerName);

    // Create shipment
    const result = await provider.createShipment(order);

    if (result.success) {
      // Update order
      await this.orderRepository.update(orderId, {
        tracking_number: result.trackingNumber,
        shipping_status: 'pending_pickup' as any,
      });

      // Create tracking history
      await this.addTrackingHistory({
        order_id: orderId,
        status: 'pending_pickup',
        description: 'Đơn hàng đã được tạo và chờ lấy hàng',
        shipping_provider: providerName,
        timestamp: new Date(),
      });
    }

    return result;
  }

  /**
   * Get tracking information from provider
   */
  async getTracking(trackingNumber: string, providerName: string = 'ghn'): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { tracking_number: trackingNumber },
    });

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
        shipping_provider: providerName,
        timestamp: event.timestamp,
      });
    }

    return trackingInfo;
  }

  /**
   * Add tracking history event
   */
  async addTrackingHistory(data: Partial<TrackingHistory>): Promise<TrackingHistory> {
    // Check if event already exists to avoid duplicates
    const existing = await this.trackingHistoryRepository.findOne({
      where: {
        order_id: data.order_id,
        status: data.status,
        timestamp: data.timestamp,
      },
    });

    if (existing) {
      return existing;
    }

    return this.trackingHistoryRepository.save(data);
  }

  /**
   * Get tracking history for order
   */
  async getTrackingHistory(orderId: number): Promise<TrackingHistory[]> {
    return this.trackingHistoryRepository.find({
      where: { order_id: orderId },
      order: { timestamp: 'ASC' },
    });
  }

  /**
   * Get tracking history by order tracking number
   */
  async getTrackingHistoryByNumber(trackingNumber: string): Promise<TrackingHistory[]> {
    const order = await this.orderRepository.findOne({
      where: { tracking_number: trackingNumber },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.getTrackingHistory(order.id);
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(orderId: number, providerName: string = 'ghn'): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order || !order.tracking_number) {
      throw new NotFoundException('Order or tracking number not found');
    }

    const provider = this.shippingProviderService.getProvider(providerName);
    const result = await provider.cancelShipment(order.tracking_number);

    if (result) {
      // Add cancellation to tracking history
      await this.addTrackingHistory({
        order_id: orderId,
        status: 'cancelled',
        description: 'Đơn hàng đã bị hủy',
        shipping_provider: providerName,
        timestamp: new Date(),
      });

      // Update order status
      await this.orderRepository.update(orderId, {
        shipping_status: 'cancelled' as any,
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