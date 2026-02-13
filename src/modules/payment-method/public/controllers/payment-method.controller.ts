import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { PublicPaymentMethodService } from '@/modules/payment-method/public/services/payment-method.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Controller('public/payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PublicPaymentMethodService) { }

  @Get()
  @Permission('public')
  async getList() {
    return this.paymentMethodService.getList({ status: BasicStatus.active });
  }

  @Get('active')
  @Permission('public')
  async getActive() {
    return this.paymentMethodService.getList({ status: BasicStatus.active });
  }

  @Get(':id')
  @Permission('public')
  async getOne(@Param('id') id: string) {
    return this.paymentMethodService.getOne(+id);
  }
}