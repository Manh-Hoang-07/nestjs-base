import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as https from 'https';
import {
  IPaymentGateway,
  PaymentGatewayConfig,
  CreatePaymentParams,
  PaymentResponse,
  VerifyPaymentParams,
  VerifyPaymentResponse,
} from '../interfaces/payment-gateway.interface';
import { buildSignatureString } from '../utils/signature.helper';

@Injectable()
export class MomoGateway implements IPaymentGateway {
  private config: PaymentGatewayConfig;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? 'https://payment.momo.vn/v2/gateway/api/create'
      : 'https://test-payment.momo.vn/v2/gateway/api/create';
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    this.config = {
      apiUrl,
      apiKey: process.env.MOMO_PARTNER_CODE || '',
      secretKey: process.env.MOMO_SECRET_KEY || '',
      returnUrl: `${baseUrl}/payment/momo/return`,
      cancelUrl: `${baseUrl}/payment/cancel`,
      notifyUrl: `${baseUrl}/payment/momo/ipn`,
    };
  }

  /**
   * Create Momo payment request
   */
  async create(params: CreatePaymentParams): Promise<PaymentResponse> {
    try {
      const requestId = `${params.orderId}_${Date.now()}`;
      const orderId = params.orderId;
      const amount = Math.round(params.amount);
      const orderInfo = params.description || `Thanh toan don hang ${orderId}`;

      const rawSignature = buildSignatureString({
        accessKey: process.env.MOMO_ACCESS_KEY || '',
        amount,
        extraData: '',
        ipnUrl: this.config.notifyUrl,
        orderId,
        orderInfo,
        partnerCode: this.config.apiKey,
        redirectUrl: this.config.returnUrl,
        requestId,
        requestType: 'captureWallet',
      });

      const signature = crypto.createHmac('sha256', this.config.secretKey).update(rawSignature).digest('hex');

      const requestBody = {
        partnerCode: this.config.apiKey,
        partnerName: 'E-commerce Shop',
        storeId: 'MomoStore',
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: this.config.returnUrl,
        ipnUrl: this.config.notifyUrl,
        lang: 'vi',
        extraData: '',
        requestType: 'captureWallet',
        signature,
      };

      const response: any = await this.makeHttpRequest(this.config.apiUrl, requestBody);

      if (response.resultCode === 0) {
        return {
          success: true,
          paymentUrl: response.payUrl,
          transactionId: orderId,
          data: response,
        };
      } else {
        return {
          success: false,
          error: response.message || 'Payment creation failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify Momo payment return
   */
  async verify(
    params: VerifyPaymentParams,
  ): Promise<VerifyPaymentResponse> {
    try {
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
      } = params.queryParams;

      const rawSignature = buildSignatureString({
        accessKey: process.env.MOMO_ACCESS_KEY || '',
        amount,
        extraData,
        message,
        orderId,
        orderInfo,
        orderType,
        partnerCode,
        payType,
        requestId,
        responseTime,
        resultCode,
        transId,
      });

      const expectedSignature = crypto.createHmac('sha256', this.config.secretKey).update(rawSignature).digest('hex');

      if (signature === expectedSignature) {
        return {
          success: resultCode === 0,
          transactionId: orderId,
          amount: parseInt(amount),
          status: resultCode === 0 ? 'success' : 'failed',
          message: message || this.getResponseMessage(resultCode),
        };
      } else {
        return {
          success: false,
          transactionId: orderId,
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
   * Handle Momo IPN (Instant Payment Notification)
   */
  async webhook(payload: any): Promise<any> {
    try {
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
      } = payload;

      const rawSignature = buildSignatureString({
        accessKey: process.env.MOMO_ACCESS_KEY || '',
        amount,
        extraData,
        message,
        orderId,
        orderInfo,
        orderType,
        partnerCode,
        payType,
        requestId,
        responseTime,
        resultCode,
        transId,
      });

      const expectedSignature = crypto.createHmac('sha256', this.config.secretKey).update(rawSignature).digest('hex');

      if (signature === expectedSignature) {
        return {
          resultCode: 0,
          message: 'success',
          data: { orderId, amount: parseInt(amount), success: resultCode === 0, transId },
        };
      } else {
        return {
          resultCode: 97,
          message: 'Invalid signature',
        };
      }
    } catch (error) {
      return {
        resultCode: 99,
        message: error.message,
      };
    }
  }

  /**
   * Make HTTP request using native https module
   */
  private makeHttpRequest(url: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Get response message from Momo result code
   */
  private getResponseMessage(code: number): string {
    const messages: Record<number, string> = {
      0: 'Giao dịch thành công',
      9000: 'Giao dịch được khởi tạo, chờ người dùng xác nhận thanh toán',
      8000: 'Giao dịch đang ở trạng thái cần được cập nhật trạng thái',
      7000: 'Giao dịch đang được xử lý',
      1000: 'Giao dịch đã được khởi tạo, chờ người dùng xác nhận thanh toán',
      11: 'Truy cập bị từ chối',
      12: 'Phiên bản API không được hỗ trợ cho yêu cầu này',
      13: 'Xác thực doanh nghiệp thất bại',
      20: 'Yêu cầu sai định dạng',
      21: 'Số tiền giao dịch không hợp lệ',
      40: 'RequestId bị trùng',
      41: 'OrderId bị trùng',
      42: 'OrderId không hợp lệ hoặc không được tìm thấy',
      43: 'Yêu cầu bị từ chối vì xung đột trong quá trình xử lý giao dịch',
      1001: 'Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền',
      1002: 'Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán',
      1003: 'Giao dịch bị huỷ',
      1004: 'Giao dịch thất bại do số tiền thanh toán vượt quá hạn mức thanh toán của người dùng',
      1005: 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
      1006: 'Giao dịch thất bại do người dùng đã từ chối xác nhận thanh toán',
      1007: 'Giao dịch bị từ chối vì tài khoản người dùng đang ở trạng thái tạm khoá',
      1026: 'Giao dịch bị hạn chế theo thể lệ chương trình khuyến mãi',
      1080: 'Giao dịch hoàn tiền bị từ chối. Giao dịch thanh toán ban đầu không được tìm thấy',
      1081: 'Giao dịch hoàn tiền bị từ chối. Giao dịch thanh toán ban đầu đã được hoàn',
      2001: 'Giao dịch thất bại do sai thông tin liên kết',
      2007: 'Giao dịch thất bại do tài khoản người dùng không tồn tại',
      3001: 'Liên kết thanh toán không tồn tại',
      3002: 'Liên kết thanh toán đã được sử dụng',
      3003: 'Liên kết thanh toán không đúng/hết hạn',
      4001: 'Giao dịch bị hạn chế do người dùng chưa hoàn tất xác thực tài khoản',
      4010: 'Không tìm thấy dữ liệu đơn hàng',
      4011: 'Số tiền hoàn tiền không hợp lệ. Số tiền hoàn trả phải nhỏ hơn hoặc bằng số tiền gốc',
      4015: 'Đơn hàng đã hết hạn hoặc không tồn tại',
      4100: 'Giao dịch bị từ chối vì người dùng chưa đăng ký tài khoản MoMo',
      99: 'Lỗi không xác định',
    };
    return messages[code] || 'Lỗi không xác định';
  }
}
