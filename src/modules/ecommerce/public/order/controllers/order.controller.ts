import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicOrderService } from '@/modules/ecommerce/public/order/services/order.service';
import { CreateOrderDto } from '@/modules/ecommerce/public/order/dtos/create-order.dto';
import { GetOrdersDto } from '@/modules/ecommerce/public/order/dtos/get-orders.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Auth } from '@/common/utils/auth.util';

@Controller('public/orders')
export class PublicOrderController {
  constructor(private readonly orderService: PublicOrderService) { }

  @Permission('public')
  @Get()
  async getList(
    @Query(ValidationPipe) query: GetOrdersDto,
  ) {
    const userId = Auth.id() || undefined;
    return this.orderService.getOrders(query, userId);
  }

  @Permission('public')
  @Get('access')
  async getOrderByAccessKey(
    @Query('orderCode') orderCode: string,
    @Query('hashKey') hashKey: string,
  ) {
    return this.orderService.getOrderByAccessKey(orderCode, hashKey);
  }

  @Permission('public')
  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = Auth.id() || undefined;
    return this.orderService.getOrderById(id, userId);
  }

  @LogRequest()
  @Permission('public')
  @Post()
  async create(
    @Body(ValidationPipe) dto: CreateOrderDto,
  ) {
    const userId = Auth.id() || undefined;
    return this.orderService.createOrderFromCart(dto, userId);
  }

  @LogRequest()
  @Permission('public')
  @Put(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = Auth.id() || undefined;
    return this.orderService.cancel(id, userId);
  }
}