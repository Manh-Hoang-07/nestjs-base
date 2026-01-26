import { Injectable } from '@nestjs/common';
import { IShippingProvider } from '../interfaces/shipping-provider.interface';
import { GHNProvider } from '../providers/ghn.provider';

@Injectable()
export class ShippingProviderService {
  private providers: Map<string, IShippingProvider>;

  constructor(private readonly ghnProvider: GHNProvider) {
    this.providers = new Map();
    this.providers.set('ghn', this.ghnProvider);
    // Add more providers here as needed
    // this.providers.set('viettel_post', this.viettelPostProvider);
    // this.providers.set('ghtk', this.ghtkProvider);
  }

  /**
   * Get a shipping provider by name
   */
  getProvider(providerName: string): IShippingProvider {
    const provider = this.providers.get(providerName.toLowerCase());
    if (!provider) {
      throw new Error(`Shipping provider '${providerName}' not found`);
    }
    return provider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider exists
   */
  hasProvider(providerName: string): boolean {
    return this.providers.has(providerName.toLowerCase());
  }
}