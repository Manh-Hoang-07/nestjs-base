export interface PaymentGatewayConfig {
  apiUrl: string;
  apiKey: string;
  secretKey: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface CreatePaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  metadata?: Record<string, any>;
  clientIp?: string; // Client IP address for VNPay
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
  data?: any;
}

export interface VerifyPaymentParams {
  transactionId: string;
  queryParams: Record<string, any>;
}

export interface VerifyPaymentResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  message?: string;
}

export interface IPaymentGateway {
  create(params: CreatePaymentParams): Promise<PaymentResponse>;
  verify(params: VerifyPaymentParams): Promise<VerifyPaymentResponse>;
  webhook(payload: any): Promise<any>;
}


