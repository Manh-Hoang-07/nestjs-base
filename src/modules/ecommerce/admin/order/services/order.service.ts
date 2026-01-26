import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CrudService } from '@/common/base/services/crud.service';
import { Order } from '@/shared/entities/order.entity';
import { OrderItem } from '@/shared/entities/order-item.entity';
import { Payment } from '@/shared/entities/payment.entity';
import { RequestContext } from '@/common/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/utils/group-ownership.util';
import { GetOrdersDto } from '@/modules/ecommerce/admin/order/dtos/get-orders.dto';
import { UpdateOrderStatusDto } from '@/modules/ecommerce/admin/order/dtos/update-order-status.dto';
import { UpdateOrderDto } from '@/modules/ecommerce/admin/order/dtos/update-order.dto';

@Injectable()
export class AdminOrderService extends CrudService<Order> {
  constructor(
    @InjectRepository(Order)
    protected readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    super(orderRepository);
  }

  /**
   * Mặc định filter theo group/context nếu có
   */
  protected override prepareFilters(filters?: any, _options?: any): boolean | any {
    const prepared = { ...(filters || {}) };

    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const groupId = RequestContext.get<number | null>('groupId');

      // Nếu context không phải system (contextId !== 1) và có ref_id, dùng ref_id làm group_id
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = groupId;
      }
    }

    return prepared;
  }

  /**
   * Override prepareOptions để load relations mặc định
   */
  protected override prepareOptions(queryOptions: any = {}): { page: number; limit: number; relations: string[]; sort: any; } {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: [
        'user',
        'shipping_method',
        'items',
        'items.product',
        'items.variant',
        'payments',
        'payments.payment_method'
      ],
    };
  }

  /**
   * Get order by ID with relations
   */
  async getOrderById(orderId: string): Promise<Order> {
    const id = parseInt(orderId);
    const order = await this.getOne({ id }, {
      relations: [
        'user',
        'shipping_method',
        'items',
        'items.product',
        'items.variant',
        'payments',
        'payments.payment_method'
      ]
    });
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    return order;
  }

  /**
   * Update order status
   */
  /**
   * Update order status với validation
   */
  async updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const { status, notes } = updateOrderStatusDto;
    const id = parseInt(orderId);

    const order = await this.getOne({ id }, { relations: [] }); // Không cần load relations cho validation
    if (!order) throw new NotFoundException('Order not found');

    // Validate status transitions
    if (order.status === 'cancelled' && status !== 'cancelled') {
      throw new BadRequestException('Cannot change status of a cancelled order');
    }
    if (order.status === 'delivered' && status !== 'delivered') {
      throw new BadRequestException('Cannot change status of a delivered order');
    }

    // Prepare update data
    const updateData: any = { status, notes: notes || order.notes };
    if (status === 'shipped') updateData.shipped_at = new Date();
    if (status === 'delivered') updateData.delivered_at = new Date();

    const result = await this.update(id, updateData);
    // Handle both Order and ApiResponse types
    const orderResult = result && typeof result === 'object' && 'id' in result ? result : order;
    return orderResult;
  }

  /**
   * Update order details với validation
   */
  async updateOrder(orderId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const id = parseInt(orderId);
    const order = await this.getOne({ id }, { relations: [] }); // Không cần load relations cho validation
    if (!order) throw new NotFoundException('Order not found');

    // Validate restricted fields
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      const restrictedFields = ['customer_name', 'customer_email', 'customer_phone', 'shipping_address', 'billing_address'];
      for (const field of restrictedFields) {
        if ((updateOrderDto as any)[field] !== undefined) {
          throw new BadRequestException(`Cannot update ${field} for order with status ${order.status}`);
        }
      }
    }

    const result = await this.update(id, updateOrderDto);
    // Handle both Order and ApiResponse types
    const orderResult = result && typeof result === 'object' && 'id' in result ? result : order;
    return orderResult;
  }

  /**
   * Override getOne để verify ownership
   */
  override async getOne(where: any, options?: any): Promise<Order | null> {
    const order = await super.getOne(where, options);
    if (order) {
      verifyGroupOwnership(order);
    }
    return order;
  }

  /**
   * Override beforeUpdate để verify ownership
   */
  protected override async beforeUpdate(
    entity: Order,
    updateDto: any,
    response?: any
  ): Promise<boolean> {
    verifyGroupOwnership(entity);
    return true;
  }

  /**
   * Override beforeDelete để verify ownership
   */
  protected override async beforeDelete(
    entity: Order,
    response?: any
  ): Promise<boolean> {
    verifyGroupOwnership(entity);
    return true;
  }
}