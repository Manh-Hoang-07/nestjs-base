/**
 * Example: Extending Queue for Order Emails
 * 
 * This file demonstrates how to add a new job type for sending order confirmation emails.
 * Follow these steps to implement similar functionality for other features.
 */

// ============================================================================
// STEP 1: Update NotificationProcessor
// File: src/modules/core/queue/processors/notification.processor.ts
// ============================================================================

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ContentTemplateExecutionService } from '@/modules/core/content-template/services/content-template-execution.service';
import { Logger } from '@nestjs/common';

@Processor('notification')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(
        private readonly contentTemplateService: ContentTemplateExecutionService,
        // Inject OrderService if you need to fetch order data
        // private readonly orderService: OrderService,
    ) { }

    // Existing job handler
    @Process('send_email_template')
    async handleSendEmail(job: Job) {
        this.logger.debug(`Processing job ${job.id}: send_email_template`);
        try {
            const { templateCode, options } = job.data;
            await this.contentTemplateService.execute(templateCode, options);
            this.logger.debug(`Job ${job.id} completed`);
        } catch (error) {
            this.logger.error(`Job ${job.id} failed`, error);
            throw error;
        }
    }

    // NEW: Order email job handler
    @Process({
        name: 'send_order_email',
        concurrency: 10  // Higher concurrency for order emails
    })
    async handleOrderEmail(job: Job) {
        this.logger.debug(`Processing job ${job.id}: send_order_email`);
        try {
            const { orderId, customerEmail, orderData } = job.data;

            // Option 1: Receive full order data in job
            if (orderData) {
                await this.contentTemplateService.execute('order_confirmation', {
                    to: customerEmail,
                    variables: {
                        orderNumber: orderData.number,
                        customerName: orderData.customerName,
                        items: orderData.items,
                        subtotal: orderData.subtotal,
                        tax: orderData.tax,
                        total: orderData.total,
                        orderDate: orderData.createdAt,
                        estimatedDelivery: orderData.estimatedDelivery,
                    },
                });
            }

            // Option 2: Fetch order data from database
            // const order = await this.orderService.findById(orderId);
            // await this.contentTemplateService.execute('order_confirmation', {
            //   to: order.customerEmail,
            //   variables: { ... },
            // });

            this.logger.debug(`Job ${job.id} completed`);
        } catch (error) {
            this.logger.error(`Job ${job.id} failed`, error);
            throw error;
        }
    }

    // NEW: Order status update email
    @Process({
        name: 'send_order_status_update',
        concurrency: 15
    })
    async handleOrderStatusUpdate(job: Job) {
        this.logger.debug(`Processing job ${job.id}: send_order_status_update`);
        try {
            const { orderId, status, customerEmail, orderNumber } = job.data;

            await this.contentTemplateService.execute('order_status_update', {
                to: customerEmail,
                variables: {
                    orderNumber,
                    status,
                    statusMessage: this.getStatusMessage(status),
                    trackingUrl: `${process.env.APP_URL}/orders/${orderId}/track`,
                },
            });

            this.logger.debug(`Job ${job.id} completed`);
        } catch (error) {
            this.logger.error(`Job ${job.id} failed`, error);
            throw error;
        }
    }

    private getStatusMessage(status: string): string {
        const messages = {
            pending: 'Đơn hàng đang chờ xử lý',
            confirmed: 'Đơn hàng đã được xác nhận',
            processing: 'Đơn hàng đang được chuẩn bị',
            shipping: 'Đơn hàng đang được giao',
            delivered: 'Đơn hàng đã được giao thành công',
            cancelled: 'Đơn hàng đã bị hủy',
        };
        return messages[status] || 'Trạng thái đơn hàng đã thay đổi';
    }
}

// ============================================================================
// STEP 2: Create/Update OrderService
// File: src/modules/order/services/order.service.ts
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class OrderService {
    constructor(
        @InjectQueue('notification')
        private readonly notificationQueue: Queue,
        // ... other dependencies
    ) { }

    async createOrder(dto: CreateOrderDto, userId: number) {
        // 1. Create order in database
        const order = await this.orderRepository.create({
            ...dto,
            userId,
            status: 'pending',
        });

        // 2. Queue order confirmation email
        await this.notificationQueue.add('send_order_email', {
            orderId: order.id,
            customerEmail: order.customerEmail,
            orderData: {
                number: order.number,
                customerName: order.customerName,
                items: order.items,
                subtotal: order.subtotal,
                tax: order.tax,
                total: order.total,
                createdAt: order.createdAt,
                estimatedDelivery: this.calculateEstimatedDelivery(),
            },
        }, {
            jobId: `order-confirmation-${order.id}`,
            priority: 1,  // High priority
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: true,
        });

        return order;
    }

    async updateOrderStatus(orderId: number, status: string) {
        // 1. Update order status
        const order = await this.orderRepository.update(orderId, { status });

        // 2. Queue status update email
        await this.notificationQueue.add('send_order_status_update', {
            orderId: order.id,
            status,
            customerEmail: order.customerEmail,
            orderNumber: order.number,
        }, {
            jobId: `order-status-${order.id}-${status}-${Date.now()}`,
            priority: 2,  // Medium priority
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true,
        });

        return order;
    }

    private calculateEstimatedDelivery(): Date {
        const date = new Date();
        date.setDate(date.getDate() + 3); // 3 days from now
        return date;
    }
}

// ============================================================================
// STEP 3: Update OrderModule
// File: src/modules/order/order.module.ts
// ============================================================================

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'notification',
        }),
        // ... other imports
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule { }

// ============================================================================
// STEP 4: Create Email Templates
// ============================================================================

/**
 * Template: order_confirmation
 * Subject: Xác nhận đơn hàng #{{orderNumber}}
 * 
 * Content:
 * Xin chào {{customerName}},
 * 
 * Cảm ơn bạn đã đặt hàng! Đơn hàng #{{orderNumber}} của bạn đã được xác nhận.
 * 
 * Chi tiết đơn hàng:
 * {{#each items}}
 * - {{this.name}} x {{this.quantity}}: {{this.price}}đ
 * {{/each}}
 * 
 * Tạm tính: {{subtotal}}đ
 * Thuế: {{tax}}đ
 * Tổng cộng: {{total}}đ
 * 
 * Ngày đặt hàng: {{orderDate}}
 * Dự kiến giao hàng: {{estimatedDelivery}}
 */

/**
 * Template: order_status_update
 * Subject: Cập nhật đơn hàng #{{orderNumber}}
 * 
 * Content:
 * Xin chào,
 * 
 * Đơn hàng #{{orderNumber}} của bạn đã được cập nhật.
 * 
 * Trạng thái mới: {{statusMessage}}
 * 
 * Theo dõi đơn hàng tại: {{trackingUrl}}
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Create order and send confirmation email
 */
async function exampleCreateOrder() {
    const order = await orderService.createOrder({
        items: [
            { productId: 1, quantity: 2, price: 100000 },
            { productId: 2, quantity: 1, price: 200000 },
        ],
        customerEmail: 'customer@example.com',
        customerName: 'Nguyễn Văn A',
        shippingAddress: '123 ABC Street',
    }, userId);

    // Email will be sent automatically via queue
    return order;
}

/**
 * Example 2: Update order status and notify customer
 */
async function exampleUpdateOrderStatus() {
    const order = await orderService.updateOrderStatus(orderId, 'shipping');

    // Status update email will be sent automatically via queue
    return order;
}

/**
 * Example 3: Bulk order processing
 */
async function exampleBulkOrderProcessing() {
    const orders = await orderRepository.findPendingOrders();

    for (const order of orders) {
        await notificationQueue.add('send_order_status_update', {
            orderId: order.id,
            status: 'processing',
            customerEmail: order.customerEmail,
            orderNumber: order.number,
        }, {
            jobId: `bulk-order-${order.id}-${Date.now()}`,
            priority: 3,  // Lower priority for bulk operations
        });
    }
}

// ============================================================================
// ADVANCED: Priority-based Queue
// ============================================================================

/**
 * Job Priorities:
 * 1 = Highest (Order confirmations, payment confirmations)
 * 2 = High (Order status updates)
 * 3 = Medium (Marketing emails)
 * 4 = Low (Newsletters)
 */

async function exampleWithPriority() {
    // High priority: Order confirmation
    await notificationQueue.add('send_order_email', data, { priority: 1 });

    // Medium priority: Status update
    await notificationQueue.add('send_order_status_update', data, { priority: 2 });

    // Low priority: Newsletter
    await notificationQueue.add('send_newsletter', data, { priority: 4 });
}

// ============================================================================
// MONITORING
// ============================================================================

/**
 * Get queue statistics
 */
async function getQueueStats() {
    const queue = notificationQueue;

    const waiting = await queue.getWaitingCount();
    const active = await queue.getActiveCount();
    const completed = await queue.getCompletedCount();
    const failed = await queue.getFailedCount();

    return {
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed,
    };
}

/**
 * Get failed jobs for debugging
 */
async function getFailedJobs() {
    const failedJobs = await notificationQueue.getFailed();

    return failedJobs.map(job => ({
        id: job.id,
        name: job.name,
        data: job.data,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attemptsMade: job.attemptsMade,
    }));
}

/**
 * Retry failed jobs
 */
async function retryFailedJobs() {
    const failedJobs = await notificationQueue.getFailed();

    for (const job of failedJobs) {
        await job.retry();
    }
}
