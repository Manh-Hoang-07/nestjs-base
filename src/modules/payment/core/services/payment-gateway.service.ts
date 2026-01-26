import { Injectable } from '@nestjs/common';
import { VNPayGateway } from '../gateways/vnpay.gateway';
import { MomoGateway } from '../gateways/momo.gateway';
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';

@Injectable()
export class PaymentGatewayService {
  private gateways: Map<string, IPaymentGateway>;

  constructor(
    private readonly vnpayGateway: VNPayGateway,
    private readonly momoGateway: MomoGateway,
  ) {
    this.gateways = new Map<string, IPaymentGateway>();
    this.gateways.set('vnpay', this.vnpayGateway);
    this.gateways.set('momo', this.momoGateway);
  }

  /**
   * Get payment gateway by name
   */
  getGateway(gatewayName: string): IPaymentGateway {
    const gateway = this.gateways.get(gatewayName.toLowerCase());
    if (!gateway) {
      throw new Error(`Payment gateway ${gatewayName} not found`);
    }
    return gateway;
  }

  /**
   * Check if gateway is supported
   */
  isSupported(gatewayName: string): boolean {
    return this.gateways.has(gatewayName.toLowerCase());
  }

  /**
   * Get all supported gateways
   */
  getSupportedGateways(): string[] {
    return Array.from(this.gateways.keys());
  }
}


