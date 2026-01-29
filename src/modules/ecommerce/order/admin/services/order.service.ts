import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Order } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/order.repository';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';
import {
  getOrderStatusMetadata,
  getPaymentStatusMetadata,
  getShippingStatusMetadata
} from '../../utils/order-status.config';

@Injectable()
export class AdminOrderService extends BaseService<Order, IOrderRepository> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    protected readonly orderRepository: IOrderRepository,
  ) {
    super(orderRepository);
  }

  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  async getOrderById(id: string | number | bigint) {
    const order = await this.getOne(id);

    // Add status metadata
    return {
      ...order,
      available_statuses: getOrderStatusMetadata(order.status).availableTransitions,
      all_order_statuses: getOrderStatusMetadata(order.status).allStatuses,
      all_payment_statuses: getPaymentStatusMetadata().allStatuses,
      all_shipping_statuses: getShippingStatusMetadata().allStatuses,
    };
  }

  async softDelete(id: string | number | bigint) {
    return this.delete(id);
  }

  protected override async prepareFilters(filters?: any, _options?: any): Promise<any> {
    const prepared = { ...(filters || {}) };
    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const groupId = RequestContext.get<number | null>('groupId');
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = groupId;
      }
    }
    return prepared;
  }

  async updateOrderStatus(orderId: string | number | bigint, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    verifyGroupOwnership(order);

    if (order.status === 'cancelled' && dto.status !== 'cancelled') {
      throw new BadRequestException('Cannot change status of a cancelled order');
    }
    if (order.status === 'delivered' && dto.status !== 'delivered') {
      throw new BadRequestException('Cannot change status of a delivered order');
    }

    const updateData: any = { status: dto.status };
    if (dto.notes) updateData.notes = dto.notes;
    if (dto.status === 'shipped') updateData.shipped_at = new Date();
    if (dto.status === 'delivered') updateData.delivered_at = new Date();

    return this.repository.update(orderId, updateData);
  }

  async updateOrder(orderId: string | number | bigint, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    verifyGroupOwnership(order);

    return this.repository.update(orderId, dto);
  }

  override async getOne(id: string | number | bigint): Promise<Order> {
    const order = await super.getOne(id);
    if (!order) throw new NotFoundException('Order not found');
    verifyGroupOwnership(order);
    return order;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const order = await this.repository.findById(id);
    if (order) verifyGroupOwnership(order);
    return true;
  }
}