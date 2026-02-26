/**
 * Unified Tracking Module
 * Combines client-side Pixel + server-side CAPI with event deduplication.
 */

export { initMetaPixel, trackMetaPageView } from '$lib/tracking/meta-pixel';

export { initGA4, trackGA4PageView, trackGA4ViewCheckout, trackGA4PaymentClick } from '$lib/tracking/ga4';

export { consent } from '$lib/tracking/consent.svelte';

import { trackMetaAddToCart, trackMetaInitiateCheckout, trackMetaViewContent } from '$lib/tracking/meta-pixel';
import {
  trackGA4AddToCart,
  trackGA4BeginCheckout,
  trackGA4ViewItem,
  trackGA4FakeDoor
} from '$lib/tracking/ga4';
import { generateEventId } from '$lib/tracking/dedup';
import { track_add_to_cart, track_view_content, track_checkout } from '$lib/tracking/tracking.remote';
import { browser } from '$app/environment';

/**
 * Unified tracking for Product View (client Pixel + server CAPI)
 */
export function trackProductView(productId: string, productName: string, price: number): void {
  const eventId = generateEventId();
  const sourceUrl = browser ? window.location.href : '';

  // Client-side
  trackMetaViewContent(productId, productName, price, eventId);
  trackGA4ViewItem(productId, productName, price);

  // Server-side (fire-and-forget)
  track_view_content({ productId, productName, price, eventId, sourceUrl }).catch(() => {});
}

/**
 * Unified tracking for Add to Cart (client Pixel + server CAPI)
 */
export function trackAddToCart(productId: string, productName: string, price: number): void {
  const eventId = generateEventId();
  const sourceUrl = browser ? window.location.href : '';

  // Client-side
  trackMetaAddToCart(productId, productName, price, eventId);
  trackGA4AddToCart(productId, productName, price);
  trackGA4FakeDoor('add_to_cart', [productId]);

  // Server-side (fire-and-forget)
  track_add_to_cart({ productId, productName, price, eventId, sourceUrl }).catch(() => {});
}

/**
 * Unified tracking for Checkout (client Pixel + server CAPI)
 */
export function trackCheckoutClick(
  items: Array<{ id: string; name: string; price: number; quantity: number }>,
  totalValue: number
): void {
  const eventId = generateEventId();
  const sourceUrl = browser ? window.location.href : '';
  const productIds = items.map((item) => item.id);

  // Client-side
  trackMetaInitiateCheckout(productIds, totalValue, eventId);
  trackGA4BeginCheckout(items, totalValue);
  trackGA4FakeDoor('checkout', productIds);

  // Server-side (fire-and-forget)
  track_checkout({
    productIds,
    totalValue,
    numItems: items.length,
    eventId,
    sourceUrl
  }).catch(() => {});
}
