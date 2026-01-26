import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AdminOrderService } from '@/modules/ecommerce/admin/order/services/order.service';
import { GetOrdersDto } from '@/modules/ecommerce/admin/order/dtos/get-orders.dto';
import { UpdateOrderStatusDto } from '@/modules/ecommerce/admin/order/dtos/update-order-status.dto';
import { UpdateOrderDto } from '@/modules/ecommerce/admin/order/dtos/update-order.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard)
export class AdminOrderController {
  constructor(private readonly orderService: AdminOrderService) { }

  @Get()
  @Permission('read:orders', 'update:orders', 'order.manage')
  async getList(@Query() query: GetOrdersDto) {
    const { filters, options } = prepareQuery(query);
    return this.orderService.getList(filters, options);
  }

  @Get('simple')
  @Permission('read:orders', 'update:orders', 'order.manage')
  async getSimpleList(@Query() query: GetOrdersDto) {
    const { filters, options } = prepareQuery(query);
    return this.orderService.getSimpleList(filters, options);
  }

  // Statistics endpoint removed as service method was deleted

  @Get(':id')
  @Permission('read:orders', 'update:orders', 'order.manage')
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @LogRequest()
  @Patch(':id/status')
  @Permission('read:orders', 'update:orders', 'order.manage')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto);
  }

  @LogRequest()
  @Patch(':id')
  @Permission('read:orders', 'update:orders', 'order.manage')
  async updateOrder(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, dto);
  }

  // Cancel order endpoint removed as service method was deleted
}