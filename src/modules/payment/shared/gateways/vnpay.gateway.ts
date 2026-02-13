import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
    IPaymentGateway,
    PaymentGatewayConfig,
    CreatePaymentParams,
    PaymentResponse,
    VerifyPaymentParams,
    VerifyPaymentResponse,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class VNPayGateway implements IPaymentGateway {
    private readonly logger = new Logger(VNPayGateway.name);
    private config: PaymentGatewayConfig;

    constructor() {
        const tmnCode = (process.env.VNPAY_TMN_CODE || '').trim();
        const hashSecret = (process.env.VNPAY_HASH_SECRET || '').trim();
        const isProduction = process.env.NODE_ENV === 'production';
        const apiUrl = isProduction
            ? 'https://www.vnpayment.vn/paymentv2/vpcpay.html'
            : 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

        if (tmnCode && hashSecret && apiUrl) {
            const baseUrl = process.env.APP_URL || 'http://localhost:8000';
            const apiPrefix = process.env.GLOBAL_PREFIX || 'api';

            this.config = {
                apiUrl,
                apiKey: tmnCode,
                secretKey: hashSecret,
                returnUrl: `${baseUrl}/${apiPrefix}/payment/vnpay/return`.replace(/([^:]\/)\/+/g, "$1"),
                cancelUrl: `${baseUrl}/${apiPrefix}/payment/cancel`.replace(/([^:]\/)\/+/g, "$1"),
                notifyUrl: `${baseUrl}/${apiPrefix}/payment/vnpay/ipn`.replace(/([^:]\/)\/+/g, "$1"),
            };
        }
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    async create(params: CreatePaymentParams): Promise<PaymentResponse> {
        if (!this.config) {
            return {
                success: false,
                error: 'Cấu hình VNPay không hợp lệ hoặc thiếu thông tin.',
            };
        }
        try {
            const date = new Date();
            const createDate = this.formatDate(date);
            const orderId = params.orderId;
            const amount = Math.round(params.amount * 100);
            const clientIp = params.clientIp || '127.0.0.1';

            let vnp_Params: any = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: this.config.apiKey,
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId,
                vnp_OrderInfo: params.description || `Thanh toan don hang ${orderId}`,
                vnp_OrderType: 'other',
                vnp_Amount: amount,
                vnp_ReturnUrl: this.config.returnUrl,
                vnp_IpAddr: clientIp,
                vnp_CreateDate: createDate,
            };

            if (params.bankCode) {
                vnp_Params['vnp_BankCode'] = params.bankCode;
            }

            vnp_Params = this.sortObject(vnp_Params);

            const signData = Object.keys(vnp_Params)
                .map((key) => {
                    const value = vnp_Params[key];
                    if (value === undefined || value === null || value === '') return null;
                    return `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`;
                })
                .filter(Boolean)
                .join('&');

            const hmac = crypto.createHmac('sha512', this.config.secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex').toUpperCase();

            const paymentUrl = `${this.config.apiUrl}?${signData}&vnp_SecureHash=${signed}`;

            this.logger.log(`Created VNPay URL for order ${orderId}: ${paymentUrl}`);

            return {
                success: true,
                paymentUrl,
                transactionId: orderId,
                data: vnp_Params,
            };
        } catch (error) {
            this.logger.error(`Error creating VNPay payment: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Xác thực kết quả thanh toán từ VNPay (Return URL)
     */
    async verify(params: VerifyPaymentParams): Promise<VerifyPaymentResponse> {
        if (!this.config) {
            return {
                success: false,
                transactionId: params.transactionId,
                amount: 0,
                status: 'failed',
                message: 'Cấu hình VNPay không hợp lệ.',
            };
        }
        try {
            const vnp_Params = { ...params.queryParams };
            const secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            const sortedParams = this.sortObject(vnp_Params);
            const signData = Object.keys(sortedParams)
                .map((key) => {
                    const value = sortedParams[key];
                    if (value === undefined || value === null || value === '') return null;
                    return `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`;
                })
                .filter(Boolean)
                .join('&');

            const hmac = crypto.createHmac('sha512', this.config.secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex').toUpperCase();

            const isSignatureValid = secureHash?.toUpperCase() === signed;

            if (!isSignatureValid) {
                return {
                    success: false,
                    transactionId: vnp_Params['vnp_TxnRef'],
                    amount: 0,
                    status: 'failed',
                    message: 'Sai chữ ký bảo mật',
                };
            }

            const responseCode = vnp_Params['vnp_ResponseCode'];
            const amount = parseInt(vnp_Params['vnp_Amount']) / 100;
            const isSuccess = responseCode === '00';

            return {
                success: isSuccess,
                transactionId: vnp_Params['vnp_TxnRef'],
                amount: amount,
                status: isSuccess ? 'success' : 'failed',
                message: this.getResponseMessage(responseCode),
            };
        } catch (error) {
            return {
                success: false,
                transactionId: params.transactionId,
                amount: 0,
                status: 'failed',
                message: error.message,
            };
        }
    }

    /**
     * Xử lý IPN từ VNPay
     */
    async webhook(payload: any): Promise<any> {
        if (!this.config) {
            return { RspCode: '99', Message: 'Config error' };
        }
        const verification = await this.verify({
            transactionId: payload['vnp_TxnRef'],
            queryParams: payload
        });
        if (verification.success || verification.status === 'failed') {
            return { RspCode: '00', Message: 'Confirm Success' };
        } else {
            return { RspCode: '97', Message: verification.message };
        }
    }

    private sortObject(obj: any): any {
        const sorted: any = {};
        const keys = Object.keys(obj).sort();
        keys.forEach((key) => {
            sorted[key] = obj[key];
        });
        return sorted;
    }

    private formatDate(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return (
            date.getFullYear() +
            pad(date.getMonth() + 1) +
            pad(date.getDate()) +
            pad(date.getHours()) +
            pad(date.getMinutes()) +
            pad(date.getSeconds())
        );
    }

    private getResponseMessage(code: string): string {
        const messages: Record<string, string> = {
            '00': 'Giao dịch thành công',
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Đã hết hạn chờ thanh toán.',
            '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
            '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
            '24': 'Khách hàng hủy giao dịch',
            '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'KH nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99': 'Các lỗi khác',
        };
        return messages[code] || 'Lỗi không xác định';
    }
}
