/**
 * Cart Store - Svelte 5 Runes-based cart management
 * Persisted to localStorage for session persistence
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'fold-club-cart';

type CartItem = {
	productId: number;
	quantity: number;
};

function createCartStore() {
	let items = $state<CartItem[]>(loadFromStorage());

	function loadFromStorage(): CartItem[] {
		if (!browser) return [];
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}

	function saveToStorage() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch {
			// Storage might be full or disabled
		}
	}

	function addToCart(productId: number) {
		const existing = items.find((item) => item.productId === productId);
		if (existing) {
			existing.quantity += 1;
		} else {
			items.push({ productId, quantity: 1 });
		}
		saveToStorage();
	}

	function removeFromCart(productId: number) {
		const index = items.findIndex((item) => item.productId === productId);
		if (index !== -1) {
			items.splice(index, 1);
			saveToStorage();
		}
	}

	function updateQuantity(productId: number, quantity: number) {
		const existing = items.find((item) => item.productId === productId);
		if (existing) {
			if (quantity <= 0) {
				removeFromCart(productId);
			} else {
				existing.quantity = quantity;
				saveToStorage();
			}
		}
	}

	function clearCart() {
		items.length = 0;
		saveToStorage();
	}

	function getCartCount(): number {
		return items.reduce((sum, item) => sum + item.quantity, 0);
	}

	function getCartItems(): CartItem[] {
		return items;
	}

	function getProductIds(): number[] {
		return items.map((item) => item.productId);
	}

	return {
		get items() {
			return items;
		},
		get count() {
			return getCartCount();
		},
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		getCartCount,
		getCartItems,
		getProductIds
	};
}

export const cart = createCartStore();
