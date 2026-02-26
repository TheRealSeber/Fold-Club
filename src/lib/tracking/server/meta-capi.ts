/**
 * Meta Conversions API (CAPI) Adapter
 * Sends server-side events to Meta for attribution.
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'crypto';
import type {
  TrackingPlatform,
  ViewContentParams,
  AddToCartParams,
  CheckoutParams,
  PurchaseParams
} from '$lib/tracking/server/types';

const API_VERSION = 'v21.0';

interface MetaCApiEvent {
  event_name: string;
  event_id: string;
  event_time: number;
  event_source_url: string;
  action_source: 'website';
  user_data: Record<string, unknown>;
  custom_data: Record<string, unknown>;
}

function hashSha256(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

function buildUserData(params: {
  userData: ViewContentParams['userData'];
}): Record<string, unknown> {
  const ud: Record<string, unknown> = {};
  if (params.userData.email) ud.em = [hashSha256(params.userData.email)];
  if (params.userData.ip) ud.client_ip_address = params.userData.ip;
  if (params.userData.userAgent) ud.client_user_agent = params.userData.userAgent;
  if (params.userData.fbc) ud.fbc = params.userData.fbc;
  if (params.userData.fbp) ud.fbp = params.userData.fbp;
  if (params.userData.fbclid) ud.fbclid = params.userData.fbclid;
  return ud;
}

export class MetaCapi implements TrackingPlatform {
  name = 'meta';
  private pixelId: string;
  private accessToken: string;

  constructor(pixelId: string, accessToken: string) {
    this.pixelId = pixelId;
    this.accessToken = accessToken;
  }

  private async sendEvent(event: MetaCApiEvent): Promise<void> {
    const url = `https://graph.facebook.com/${API_VERSION}/${this.pixelId}/events`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [event],
        access_token: this.accessToken
      }),
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Meta CAPI ${response.status}: ${body}`);
    }
  }

  async sendViewContent(params: ViewContentParams): Promise<void> {
    await this.sendEvent({
      event_name: 'ViewContent',
      event_id: params.eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.sourceUrl,
      action_source: 'website',
      user_data: buildUserData(params),
      custom_data: {
        content_ids: [params.productId],
        content_name: params.productName,
        content_type: 'product',
        value: params.value / 100,
        currency: params.currency
      }
    });
  }

  async sendAddToCart(params: AddToCartParams): Promise<void> {
    await this.sendEvent({
      event_name: 'AddToCart',
      event_id: params.eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.sourceUrl,
      action_source: 'website',
      user_data: buildUserData(params),
      custom_data: {
        content_ids: [params.productId],
        content_name: params.productName,
        content_type: 'product',
        value: params.value / 100,
        currency: params.currency
      }
    });
  }

  async sendInitiateCheckout(params: CheckoutParams): Promise<void> {
    await this.sendEvent({
      event_name: 'InitiateCheckout',
      event_id: params.eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.sourceUrl,
      action_source: 'website',
      user_data: buildUserData(params),
      custom_data: {
        content_ids: params.productIds,
        content_type: 'product',
        value: params.value / 100,
        currency: params.currency,
        num_items: params.numItems
      }
    });
  }

  async sendPurchase(params: PurchaseParams): Promise<void> {
    await this.sendEvent({
      event_name: 'Purchase',
      event_id: params.eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.sourceUrl,
      action_source: 'website',
      user_data: buildUserData(params),
      custom_data: {
        content_ids: params.productIds,
        content_type: 'product',
        value: params.value / 100,
        currency: params.currency,
        num_items: params.numItems
      }
    });
  }
}
