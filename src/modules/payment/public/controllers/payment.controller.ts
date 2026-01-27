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
import { CreatePaymentUrlDto } from '../dtos/create-payment-url.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { GetPaymentsDto } from '../dtos/get-payments.dto';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    /**
     * Create payment URL for online payment
     */
    @Post('create-url')
    async createPaymentUrl(@Body() dto: CreatePaymentUrlDto) {
        return this.paymentService.create(dto);
    }

    /**
     * Create offline payment record
     */
    @Post('create')
    async createPayment(@Body() dto: CreatePaymentDto) {
        return this.paymentService.create(dto);
    }

    /**
     * VNPay return callback
     */
    @Get('vnpay/return')
    async vnpayReturn(@Query() query: any, @Res() res: Response) {
        try {
            const result = await this.paymentService.verifyPayment('vnpay', query);

            // Redirect to success or failure page
            if (result.success) {
                return res.redirect(`/payment/success?order_id=${result.transactionId}`);
            } else {
                return res.redirect(`/payment/failed?message=${encodeURIComponent(result.message)}`);
            }
        } catch (error) {
            return res.redirect(`/payment/failed?message=${encodeURIComponent(error.message)}`);
        }
    }

    /**
     * VNPay IPN (Instant Payment Notification)
     */
    @Post('vnpay/ipn')
    async vnpayIPN(@Body() body: any) {
        return this.paymentService.handleWebhook('vnpay', body);
    }

    /**
     * Get payments list
     */
    @Get()
    async getPayments(@Query() query: GetPaymentsDto) {
        return this.paymentService.getPayments(query);
    }

    /**
     * Get payment by ID
     */
    @Get(':id')
    async getPaymentById(@Param('id') id: string) {
        return this.paymentService.getPaymentById(parseInt(id));
    }
}
