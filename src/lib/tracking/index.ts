/**
 * Unified Tracking Module
 * Combines client-side Pixel + server-side CAPI with event deduplication.
 */

export {
  initMetaPixel,
  trackMetaPageView,
} from './meta-pixel';

export {
  initGA4,
  trackGA4PageView,
  trackGA4ViewCheckout,
  trackGA4PaymentClick,
} from './ga4';

export { consent } from './consent.svelte';

import { trackMetaAddToCart, trackMetaInitiateCheckout, trackMetaViewContent } from './meta-pixel';
import { trackGA4AddToCart, trackGA4BeginCheckout, trackGA4ViewItem } from './ga4';
import { generateEventId, getSessionIdFromCookie } from './dedup';
import { track_add_to_cart, track_view_content, track_checkout } from './tracking.remote';
import { browser } from '$app/environment';

/**
 * Unified tracking for Product View (client Pixel + server CAPI)
 */
export function trackProductView(productId: string, productName: string, price: number): void {
  const sessionId = getSessionIdFromCookie();
  const eventId = generateEventId('ViewContent', productId, sessionId);
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
  const sessionId = getSessionIdFromCookie();
  const eventId = generateEventId('AddToCart', productId, sessionId);
  const sourceUrl = browser ? window.location.href : '';

  // Client-side
  trackMetaAddToCart(productId, productName, price, eventId);
  trackGA4AddToCart(productId, productName, price);

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
  const sessionId = getSessionIdFromCookie();
  const eventId = generateEventId('InitiateCheckout', sessionId, sessionId);
  const sourceUrl = browser ? window.location.href : '';
  const productIds = items.map((item) => item.id);

  // Client-side
  trackMetaInitiateCheckout(productIds, totalValue, eventId);
  trackGA4BeginCheckout(items, totalValue);

  // Server-side (fire-and-forget)
  track_checkout({
    productIds,
    totalValue,
    numItems: items.length,
    eventId,
    sourceUrl,
  }).catch(() => {});
}
