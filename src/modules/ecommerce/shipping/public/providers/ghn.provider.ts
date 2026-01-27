import { Injectable } from '@nestjs/common';
import * as https from 'https';
import {
  IShippingProvider,
  ShipmentResponse,
  TrackingInfo,
  ShippingParams,
} from '../interfaces/shipping-provider.interface';
import { Order } from '@/shared/entities/order.entity';

@Injectable()
export class GHNProvider implements IShippingProvider {
  // GHN API URL (hardcoded - not sensitive)
  private apiUrl = process.env.NODE_ENV === 'production'
    ? 'https://online-gateway.ghn.vn/shiip/public-api'
    : 'https://dev-online-gateway.ghn.vn/shiip/public-api';
  private token = process.env.GHN_TOKEN;
  private shopId = process.env.GHN_SHOP_ID;

  async createShipment(order: Order): Promise<ShipmentResponse> {
    try {
      const payload = {
        shop_id: parseInt(this.shopId || '0'),
        to_name: order.customer_name,
        to_phone: order.customer_phone,
        to_address: this.formatAddress(order.shipping_address),
        to_ward_code: order.shipping_address.ward_code,
        to_district_id: order.shipping_address.district_id,
        weight: this.calculateTotalWeight(order.items),
        length: 30,
        width: 20,
        height: 10,
        service_type_id: 2, // Standard
        payment_type_id: 1, // Shop pays
        required_note: 'KHONGCHOXEMHANG',
        items: order.items.map((item: any) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: parseInt(item.unit_price || '0'),
        })),
      };

      const response = await this.makeRequest('/v2/shipping-order/create', payload);

      if (response.code === 200) {
        return {
          success: true,
          trackingNumber: response.data.order_code,
          estimatedDelivery: new Date(response.data.expected_delivery_time),
          shippingFee: response.data.total_fee,
        };
      } else {
        return {
          success: false,
          error: response.message || 'Failed to create shipment',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTracking(trackingNumber: string): Promise<TrackingInfo> {
    const response = await this.makeRequest('/v2/shipping-order/detail', {
      order_code: trackingNumber,
    });

    if (response.code === 200) {
      const data = response.data;
      return {
        trackingNumber,
        status: this.mapStatus(data.status),
        currentLocation: data.current_warehouse?.name,
        estimatedDelivery: new Date(data.expected_delivery_time),
        history: data.log.map((log: any) => ({
          status: this.mapStatus(log.status),
          location: log.location,
          timestamp: new Date(log.updated_date),
          description: log.status_name,
        })),
      };
    }

    throw new Error('Failed to get tracking info');
  }

  async calculateShippingFee(params: ShippingParams): Promise<number> {
    const payload = {
      shop_id: parseInt(this.shopId || '0'),
      from_district_id: params.fromAddress.district_id,
      to_district_id: params.toAddress.district_id,
      to_ward_code: params.toAddress.ward_code,
      weight: params.weight,
      service_type_id: 2,
    };

    const response = await this.makeRequest('/v2/shipping-order/fee', payload);

    if (response.code === 200) {
      return response.data.total;
    }

    throw new Error('Failed to calculate shipping fee');
  }

  async handleWebhook(payload: any): Promise<void> {
    // GHN webhook format
    const { OrderCode, Status, CurrentWarehouse, Time } = payload;
    
    // This should be handled by TrackingService
    // The webhook payload will be processed to update tracking history
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    const response = await this.makeRequest('/v2/shipping-order/cancel', {
      order_codes: [trackingNumber],
    });

    return response.code === 200;
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const url = new URL(endpoint, this.apiUrl);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': this.token,
          'ShopId': this.shopId,
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

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  private mapStatus(ghnStatus: string): string {
    const statusMap: Record<string, string> = {
      'ready_to_pick': 'pending',
      'picking': 'picking',
      'picked': 'in_transit',
      'storing': 'at_warehouse',
      'transporting': 'in_transit',
      'delivering': 'out_for_delivery',
      'delivered': 'delivered',
      'cancel': 'cancelled',
      'return': 'returned',
    };
    return statusMap[ghnStatus] || ghnStatus;
  }

  private formatAddress(address: any): string {
    return `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
  }

  private calculateTotalWeight(items: any[]): number {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.weight || '0') * item.quantity);
    }, 0);
  }
}