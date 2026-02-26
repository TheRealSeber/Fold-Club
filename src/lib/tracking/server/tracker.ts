/**
 * ServerTracker - Multi-platform event orchestrator
 * Registers platform adapters and fires events on all of them.
 * Failures are logged but never block the request.
 */

import type {
  TrackingPlatform,
  ViewContentParams,
  AddToCartParams,
  CheckoutParams,
  PurchaseParams
} from '$lib/tracking/server/types';

export class ServerTracker {
  private platforms: TrackingPlatform[] = [];

  register(platform: TrackingPlatform): void {
    this.platforms.push(platform);
  }

  async trackViewContent(params: ViewContentParams): Promise<void> {
    await this.fireAll('sendViewContent', params);
  }

  async trackAddToCart(params: AddToCartParams): Promise<void> {
    await this.fireAll('sendAddToCart', params);
  }

  async trackInitiateCheckout(params: CheckoutParams): Promise<void> {
    await this.fireAll('sendInitiateCheckout', params);
  }

  async trackPurchase(params: PurchaseParams): Promise<void> {
    await this.fireAll('sendPurchase', params);
  }

  private async fireAll(
    method: Exclude<keyof TrackingPlatform, 'name'>,
    params: unknown
  ): Promise<void> {
    await Promise.allSettled(
      this.platforms.map(async (platform) => {
        try {
          await (platform[method] as (p: unknown) => Promise<void>)(params);
        } catch (error) {
          console.error(`[tracking] ${platform.name}.${method} failed:`, error);
        }
      })
    );
  }
}
