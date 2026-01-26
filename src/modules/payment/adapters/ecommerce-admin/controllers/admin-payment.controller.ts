import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { AdminEcommercePaymentService } from '../services/admin-ecommerce-payment.service';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard)
export class AdminPaymentController {
  constructor(
    private readonly paymentService: AdminEcommercePaymentService,
  ) {}

  @Get()
  @Permission('order.manage')
  async getList(@Query() query: any) {
    const { filters, options } = prepareQuery(query);
    return this.paymentService.getList(filters, options);
  }

  @Get(':id')
  @Permission('order.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.getPaymentById(id);
  }

  @LogRequest()
  @Patch(':id/status')
  @Permission('order.manage')
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdatePaymentDto,
  ) {
    return this.paymentService.updatePaymentStatus(id, dto);
  }
}


