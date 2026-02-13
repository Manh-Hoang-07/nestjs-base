import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Param,
    Req,
    Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentProcessorService } from '../services/payment-processor.service';
import { PaymentManagementService } from '../services/payment-management.service';
import { CreatePaymentUrlDto } from '../dtos/create-payment-url.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { GetPaymentsDto } from '../dtos/get-payments.dto';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly paymentProcessor: PaymentProcessorService,
        private readonly paymentManagement: PaymentManagementService,
    ) { }

    /**
     * Create payment URL for online payment
     */
    @Post('create-url')
    @Permission('public')
    async createPaymentUrl(@Body() dto: CreatePaymentUrlDto) {
        return this.paymentService.create(dto);
    }

    /**
     * Create offline payment record
     */
    @Post('create')
    @Permission('public')
    async createPayment(@Body() dto: CreatePaymentDto) {
        return this.paymentService.create(dto);
    }

    /**
     * VNPay return callback
     */
    @Get('vnpay/return')
    @Permission('public')
    async vnpayReturn(@Query() query: any, @Res() res: Response) {
        try {
            const result = await this.paymentProcessor.verifyAndProcess('vnpay', query);

            if (result.success) {
                // Sử dụng order_id từ kết quả trả về
                return res.redirect(`/payment/success?order_id=${result.order_id}`);
            } else {
                return res.redirect(`/payment/failed?message=${encodeURIComponent(result.message || 'Thanh toán thất bại')}`);
            }
        } catch (error) {
            return res.redirect(`/payment/failed?message=${encodeURIComponent(error.message)}`);
        }
    }

    /**
     * VNPay IPN (Instant Payment Notification)
     */
    @Post('vnpay/ipn')
    @Permission('public')
    async vnpayIPN(@Body() body: any) {
        return this.paymentProcessor.handleWebhook('vnpay', body);
    }

    /**
     * Get payments list
     */
    @Get()
    async getPayments(@Query() query: GetPaymentsDto) {
        return this.paymentManagement.getList(query);
    }

    /**
     * Get payment by ID
     */
    @Get(':id')
    async getPaymentById(@Param('id') id: string) {
        return this.paymentManagement.getOne(id);
    }
}
