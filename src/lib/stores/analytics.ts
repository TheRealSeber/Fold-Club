/**
 * Analytics Store - Simple event tracking with localStorage persistence
 * For Fake Door Test to measure user engagement funnel
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'fold-club-analytics';

type AnalyticsEvent = {
	type: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_click';
	data: Record<string, unknown>;
	timestamp: number;
};

type AnalyticsSummary = {
	page_view: number;
	product_view: number;
	add_to_cart: number;
	checkout_click: number;
	events: AnalyticsEvent[];
};

function createAnalyticsStore() {
	function loadFromStorage(): AnalyticsEvent[] {
		if (!browser) return [];
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}

	function saveEvent(event: AnalyticsEvent) {
		if (!browser) return;
		try {
			const events = loadFromStorage();
			events.push(event);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
		} catch {
			// Storage might be full or disabled
		}
	}

	function trackPageView(page: string) {
		saveEvent({
			type: 'page_view',
			data: { page },
			timestamp: Date.now()
		});
	}

	function trackProductView(productId: number) {
		saveEvent({
			type: 'product_view',
			data: { productId },
			timestamp: Date.now()
		});
	}

	function trackAddToCart(productId: number) {
		saveEvent({
			type: 'add_to_cart',
			data: { productId },
			timestamp: Date.now()
		});
	}

	function trackCheckoutClick(cartItems: number[]) {
		saveEvent({
			type: 'checkout_click',
			data: { cartItems, itemCount: cartItems.length },
			timestamp: Date.now()
		});
	}

	function getSummary(): AnalyticsSummary {
		const events = loadFromStorage();
		return {
			page_view: events.filter((e) => e.type === 'page_view').length,
			product_view: events.filter((e) => e.type === 'product_view').length,
			add_to_cart: events.filter((e) => e.type === 'add_to_cart').length,
			checkout_click: events.filter((e) => e.type === 'checkout_click').length,
			events
		};
	}

	function clearAnalytics() {
		if (!browser) return;
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// Ignore errors
		}
	}

	function getEvents(): AnalyticsEvent[] {
		return loadFromStorage();
	}

	return {
		trackPageView,
		trackProductView,
		trackAddToCart,
		trackCheckoutClick,
		getSummary,
		clearAnalytics,
		getEvents
	};
}

export const analytics = createAnalyticsStore();
