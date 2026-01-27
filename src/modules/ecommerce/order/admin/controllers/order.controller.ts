import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { AdminOrderService } from '../services/order.service';
import { GetOrdersDto } from '../dtos/get-orders.dto';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { prepareQuery } from '@/common/core/utils/list-query.helper';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard)
export class AdminOrderController {
  constructor(private readonly orderService: AdminOrderService) { }

  @Get()
  @Permission('read:orders', 'update:orders', 'order.manage')
  async getList(@Query() query: GetOrdersDto) {
    return this.orderService.getList(query);
  }

  @Get('simple')
  @Permission('read:orders', 'update:orders', 'order.manage')
  async getSimpleList(@Query() query: GetOrdersDto) {
    return this.orderService.getSimpleList(query);
  }

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
}