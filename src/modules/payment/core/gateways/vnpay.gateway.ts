import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'qs';
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
  private config: PaymentGatewayConfig;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? 'https://www.vnpayment.vn/paymentv2/vpcpay.html'
      : 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    this.config = {
      apiUrl,
      apiKey: process.env.VNPAY_TMN_CODE || '',
      secretKey: process.env.VNPAY_HASH_SECRET || '',
      returnUrl: `${baseUrl}/payment/vnpay/return`,
      cancelUrl: `${baseUrl}/payment/cancel`,
      notifyUrl: `${baseUrl}/payment/vnpay/ipn`,
    };
  }

  /**
   * Create VNPay payment URL
   */
  async create(params: CreatePaymentParams): Promise<PaymentResponse> {
    try {
      const createDate = this.formatDate(new Date());
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

      vnp_Params = this.sortObject(vnp_Params);
      const signData = qs.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac('sha512', this.config.secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;

      let paymentUrl = this.config.apiUrl + '?' + qs.stringify(vnp_Params, { encode: false });
      if (process.env.NODE_ENV === 'development') {
        paymentUrl = `http://localhost:3000/home/payment/mock?order_id=${orderId}&order_number=${orderId}&amount=${amount}`;
      }

      return {
        success: true,
        paymentUrl,
        transactionId: orderId,
        data: vnp_Params,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify VNPay payment return
   */
  async verify(
    params: VerifyPaymentParams,
  ): Promise<VerifyPaymentResponse> {
    try {
      const vnp_Params = { ...params.queryParams };
      const secureHash = vnp_Params['vnp_SecureHash'];
      const isTestMode = process.env.NODE_ENV === 'development';

      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      const sortedParams = this.sortObject(vnp_Params);
      const signData = qs.stringify(sortedParams, { encode: false });
      
      if (!this.config.secretKey && !isTestMode) {
        return {
          success: false,
          transactionId: vnp_Params['vnp_TxnRef'],
          amount: 0,
          status: 'failed',
          message: 'VNPay secret key is not configured',
        };
      }

      let signatureValid = false;
      if (isTestMode && secureHash && secureHash.startsWith('mock_hash_')) {
        signatureValid = true;
      } else if (isTestMode && !secureHash) {
        // Bypass signature check in test mode if no hash provided
        signatureValid = true;
      } else {
        const hmac = crypto.createHmac('sha512', this.config.secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        signatureValid = secureHash === signed;
      }

      if (signatureValid) {
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

        // In test mode, if responseCode is not provided or is not '00', default to success for testing
        const isSuccess = isTestMode 
          ? (responseCode === '00' || !responseCode || responseCode === undefined)
          : responseCode === '00';

        return {
          success: isSuccess,
          transactionId: vnp_Params['vnp_TxnRef'],
          amount: amount || 0,
          status: isSuccess ? 'success' : 'failed',
          message: responseCode ? this.getResponseMessage(responseCode) : 'Test mode - payment successful',
        };
      } else {
        return {
          success: false,
          transactionId: vnp_Params['vnp_TxnRef'],
          amount: 0,
          status: 'failed',
          message: 'Invalid signature',
        };
      }
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
   * Handle VNPay IPN (Instant Payment Notification)
   */
  async webhook(payload: any): Promise<any> {
    const vnp_Params = payload;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.config.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const responseCode = vnp_Params['vnp_ResponseCode'];
      return {
        RspCode: '00',
        Message: 'success',
        data: {
          orderId: vnp_Params['vnp_TxnRef'],
          amount: parseInt(vnp_Params['vnp_Amount']) / 100,
          success: responseCode === '00',
        },
      };
    } else {
      return {
        RspCode: '97',
        Message: 'Invalid signature',
      };
    }
  }

  /**
   * Sort object keys alphabetically
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /**
   * Format date to VNPay format (yyyyMMddHHmmss)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Get response message from VNPay response code
   */
  private getResponseMessage(code: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác',
    };
    return messages[code] || 'Lỗi không xác định';
  }
}
