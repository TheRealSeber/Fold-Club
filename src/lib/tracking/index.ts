/**
 * Unified Tracking Module
 * Combines Meta Pixel + GA4 for consistent event firing
 */

export {
  initMetaPixel,
  trackMetaPageView,
  trackMetaAddToCart,
  trackMetaInitiateCheckout,
  trackMetaViewContent
} from './meta-pixel';

export {
  initGA4,
  trackGA4PageView,
  trackGA4AddToCart,
  trackGA4BeginCheckout,
  trackGA4ViewItem,
  trackGA4FakeDoor
} from './ga4';

import { trackMetaAddToCart, trackMetaInitiateCheckout, trackMetaViewContent } from './meta-pixel';
import {
  trackGA4AddToCart,
  trackGA4BeginCheckout,
  trackGA4ViewItem,
  trackGA4FakeDoor
} from './ga4';

/**
 * Unified tracking for Add to Cart (fires all pixels)
 */
export function trackAddToCart(productId: number, productName: string, price: number): void {
  // Meta Pixel
  trackMetaAddToCart(productId, productName, price);

  // GA4
  trackGA4AddToCart(productId, productName, price);
  trackGA4FakeDoor('add_to_cart', [productId]);
}

/**
 * Unified tracking for Checkout Click (fires all pixels)
 */
export function trackCheckoutClick(
  items: Array<{ id: number; name: string; price: number; quantity: number }>,
  totalValue: number
): void {
  const productIds = items.map((item) => item.id);

  // Meta Pixel
  trackMetaInitiateCheckout(productIds, totalValue);

  // GA4
  trackGA4BeginCheckout(items, totalValue);
  trackGA4FakeDoor('checkout', productIds);
}

/**
 * Unified tracking for Product View
 */
export function trackProductView(productId: number, productName: string, price: number): void {
  // Meta Pixel
  trackMetaViewContent(productId, productName, price);

  // GA4
  trackGA4ViewItem(productId, productName, price);
}
