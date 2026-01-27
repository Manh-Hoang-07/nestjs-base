import { Order } from '@/shared/entities/order.entity';

export interface Address {
  street: string;
  ward: string;
  ward_code?: string;
  district: string;
  district_id?: number;
  city: string;
  country?: string;
  postal_code?: string;
}

export interface ShippingParams {
  fromAddress: Address;
  toAddress: Address;
  weight: number;
  dimensions?: { length: number; width: number; height: number };
  serviceType?: string;
}

export interface ShipmentResponse {
  success: boolean;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippingFee?: number;
  error?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: Date;
  history: Array<{
    status: string;
    location: string;
    timestamp: Date;
    description: string;
  }>;
}

export interface IShippingProvider {
  createShipment(order: Order): Promise<ShipmentResponse>;
  getTracking(trackingNumber: string): Promise<TrackingInfo>;
  calculateShippingFee(params: ShippingParams): Promise<number>;
  handleWebhook(payload: any): Promise<void>;
  cancelShipment(trackingNumber: string): Promise<boolean>;
}