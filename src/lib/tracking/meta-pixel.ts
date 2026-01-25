/**
 * Meta Pixel (Facebook) Tracking Module
 * Pixel ID: 4349963781944006
 */

import { browser } from '$app/environment';
import { PUBLIC_META_PIXEL_ID } from '$env/static/public';

type FbqFunction = {
	(...args: unknown[]): void;
	callMethod?: (...args: unknown[]) => void;
	queue: unknown[][];
	loaded: boolean;
	version: string;
};

declare global {
	interface Window {
		fbq?: FbqFunction;
		_fbq?: FbqFunction;
	}
}

let initialized = false;

/**
 * Initialize Meta Pixel - call once in root layout
 */
export function initMetaPixel(): void {
	if (!browser || !PUBLIC_META_PIXEL_ID || initialized) return;

	// Skip if already loaded (e.g., by another script)
	if (window.fbq) return;

	// Meta Pixel Base Code (exact code from Meta)
	const n = function (...args: unknown[]) {
		if (n.callMethod) {
			n.callMethod(...args);
		} else {
			n.queue.push(args);
		}
	} as FbqFunction;

	n.queue = [];
	n.loaded = true;
	n.version = '2.0';

	if (!window._fbq) window._fbq = n;
	window.fbq = n;

	const t = document.createElement('script');
	t.async = true;
	t.src = 'https://connect.facebook.net/en_US/fbevents.js';
	const s = document.getElementsByTagName('script')[0];
	s?.parentNode?.insertBefore(t, s);

	window.fbq('init', PUBLIC_META_PIXEL_ID);
	window.fbq('track', 'PageView');

	// Add noscript fallback pixel
	const noscript = document.createElement('noscript');
	const img = document.createElement('img');
	img.height = 1;
	img.width = 1;
	img.style.display = 'none';
	img.src = `https://www.facebook.com/tr?id=${PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`;
	noscript.appendChild(img);
	document.body.appendChild(noscript);

	initialized = true;
}

/**
 * Track PageView on client-side navigation
 */
export function trackMetaPageView(): void {
	if (!browser || !window.fbq) return;
	window.fbq('track', 'PageView');
}

/**
 * Track AddToCart event
 */
export function trackMetaAddToCart(productId: number, productName: string, value: number): void {
	if (!browser || !window.fbq) return;

	window.fbq('track', 'AddToCart', {
		content_ids: [productId.toString()],
		content_name: productName,
		content_type: 'product',
		value: value,
		currency: 'PLN'
	});
}

/**
 * Track InitiateCheckout event for Fake Door
 */
export function trackMetaInitiateCheckout(productIds: number[], value: number): void {
	if (!browser || !window.fbq) return;

	window.fbq('track', 'InitiateCheckout', {
		content_ids: productIds.map((id) => id.toString()),
		content_type: 'product',
		value: value,
		currency: 'PLN',
		num_items: productIds.length
	});
}

/**
 * Track ViewContent (product view)
 */
export function trackMetaViewContent(productId: number, productName: string, value: number): void {
	if (!browser || !window.fbq) return;

	window.fbq('track', 'ViewContent', {
		content_ids: [productId.toString()],
		content_name: productName,
		content_type: 'product',
		value: value,
		currency: 'PLN'
	});
}
