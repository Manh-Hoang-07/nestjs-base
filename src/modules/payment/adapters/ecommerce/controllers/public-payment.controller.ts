import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { EcommercePaymentService } from '@/modules/payment/adapters/ecommerce/services/ecommerce-payment.service';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { CreatePaymentUrlDto } from '../dtos/create-payment-url.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('public/payments')
export class PublicPaymentController {
  constructor(private readonly paymentService: EcommercePaymentService) {}

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.paymentService.getPayments({ ...filters, ...options });
  }

  @Permission('public')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.getPaymentById(id);
  }

  @LogRequest()
  @Permission('public')
  @Post()
  async create(@Body(ValidationPipe) createDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createDto);
  }

  @LogRequest()
  @Permission('public')
  @Post('create-url')
  async createPaymentUrl(
    @Body(ValidationPipe) createDto: CreatePaymentUrlDto,
  ) {
    return this.paymentService.createPaymentUrl(createDto);
  }

  @Permission('public')
  @Get('verify/vnpay')
  async verifyVnpayPayment(@Query() query: any) {
    return this.paymentService.verifyPayment('vnpay', query);
  }

  @Permission('public')
  @Get('verify/momo')
  async verifyMomoPayment(@Query() query: any) {
    return this.paymentService.verifyPayment('momo', query);
  }

  @LogRequest()
  @Permission('public')
  @Post('webhook/vnpay')
  async handleVnpayWebhook(@Body() payload: any) {
    return this.paymentService.handleWebhook('vnpay', payload);
  }

  @LogRequest()
  @Permission('public')
  @Post('webhook/momo')
  async handleMomoWebhook(@Body() payload: any) {
    return this.paymentService.handleWebhook('momo', payload);
  }
}


