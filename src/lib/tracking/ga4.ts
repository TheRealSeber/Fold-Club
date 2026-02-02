/**
 * Google Analytics 4 Tracking Module
 * Measurement ID: G-LJTE4F48YJ
 * Stream ID: 13360580594
 */

import { browser } from '$app/environment';
import { PUBLIC_GA4_MEASUREMENT_ID } from '$env/static/public';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

/**
 * Initialize GA4 - call once in root layout
 */
export function initGA4(): void {
  if (!browser || !PUBLIC_GA4_MEASUREMENT_ID || initialized) return;

  // Create dataLayer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', PUBLIC_GA4_MEASUREMENT_ID, {
    send_page_view: true
  });

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  initialized = true;
}

/**
 * Track page_view on client-side navigation
 */
export function trackGA4PageView(pagePath: string, pageTitle: string): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle
  });
}

/**
 * Track add_to_cart event
 */
export function trackGA4AddToCart(productId: number, itemName: string, value: number): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    currency: 'PLN',
    value: value,
    items: [
      {
        item_id: productId.toString(),
        item_name: itemName,
        price: value,
        quantity: 1
      }
    ]
  });
}

/**
 * Track begin_checkout event for Fake Door
 */
export function trackGA4BeginCheckout(
  items: Array<{ id: number; name: string; price: number; quantity: number }>,
  value: number
): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'begin_checkout', {
    currency: 'PLN',
    value: value,
    items: items.map((item, index) => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      index: index
    }))
  });
}

/**
 * Track view_item (product view)
 */
export function trackGA4ViewItem(productId: number, itemName: string, value: number): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'view_item', {
    currency: 'PLN',
    value: value,
    items: [
      {
        item_id: productId.toString(),
        item_name: itemName,
        price: value,
        quantity: 1
      }
    ]
  });
}

/**
 * Track custom fake_door_interaction event for funnel analysis
 */
export function trackGA4FakeDoor(
  action: 'add_to_cart' | 'checkout' | 'payment_click',
  productIds: number[]
): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'fake_door_interaction', {
    action: action,
    product_ids: productIds.join(','),
    timestamp: Date.now()
  });
}

/**
 * Track checkout page view (separate from begin_checkout)
 */
export function trackGA4ViewCheckout(
  items: Array<{ id: number; name: string; price: number; quantity: number }>,
  value: number
): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'view_checkout', {
    currency: 'PLN',
    value: value,
    items: items.map((item, index) => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      index: index
    }))
  });
}

/**
 * Track payment button click (Przelewy24)
 */
export function trackGA4PaymentClick(
  items: Array<{ id: number; name: string; price: number; quantity: number }>,
  value: number
): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'add_payment_info', {
    currency: 'PLN',
    value: value,
    payment_type: 'przelewy24',
    items: items.map((item, index) => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      index: index
    }))
  });

  // Also track as fake door interaction
  const productIds = items.map((item) => item.id);
  trackGA4FakeDoor('payment_click', productIds);
}
