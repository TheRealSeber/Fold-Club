# Tracking Implementation

## Overview

Comprehensive tracking system for the Fold Club e-commerce funnel with Meta Pixel and Google Analytics 4.

## Tracking Events

### 1. Add to Cart
**Triggered:** When user clicks "DODAJ" button on product card
**Tracks:**
- Meta Pixel: `AddToCart`
- GA4: `add_to_cart`
- GA4 Custom: `fake_door_interaction` (action: 'add_to_cart')

**Code location:** `src/lib/tracking/index.ts` - `trackAddToCart()`

---

### 2. View Cart
**Triggered:** When user navigates to `/cart` page
**Tracks:**
- GA4: `page_view` (automatic)

---

### 3. Begin Checkout (Cart → Checkout)
**Triggered:** When user clicks "PRZEJDŹ DO ZAMÓWIENIA" in cart
**Tracks:**
- Meta Pixel: `InitiateCheckout`
- GA4: `begin_checkout`
- GA4 Custom: `fake_door_interaction` (action: 'checkout')

**Code location:** `src/routes/cart/+page.svelte` - `handleCheckoutClick()`

---

### 4. View Checkout Page
**Triggered:** When `/checkout` page loads (onMount)
**Tracks:**
- GA4: `view_checkout` (custom event)
- GA4: `page_view`

**Code location:** `src/routes/checkout/+page.svelte` - `onMount()`

**Purpose:** Track how many users actually reach the checkout page (funnel step)

---

### 5. Payment Button Click (Przelewy24)
**Triggered:** When user clicks Przelewy24 payment button
**Tracks:**
- GA4: `add_payment_info` (payment_type: 'przelewy24')
- GA4 Custom: `fake_door_interaction` (action: 'payment_click')

**Code location:** `src/routes/checkout/+page.svelte` - `handlePaymentClick()`

**Purpose:** Measure final conversion intent before showing fake door modal

---

## Funnel Stages

```
1. Product View (shop page)
   ↓
2. Add to Cart (trackAddToCart)
   ↓
3. View Cart (page_view)
   ↓
4. Begin Checkout (trackCheckoutClick → navigate to /checkout)
   ↓
5. View Checkout Page (trackGA4ViewCheckout)
   ↓
6. Payment Click (trackGA4PaymentClick → show fake door)
```

## Analytics Queries

### GA4 Custom Exploration

Filter by `fake_door_interaction` event:
- `action = 'add_to_cart'` - Products added to cart
- `action = 'checkout'` - Checkout initiated from cart
- `action = 'payment_click'` - Payment button clicked

### Conversion Rate Calculation

```
Cart → Checkout: (view_checkout events) / (begin_checkout events)
Checkout → Payment: (payment_click events) / (view_checkout events)
Overall Intent: (payment_click events) / (add_to_cart events)
```

## Files Modified

### Tracking System
- `src/lib/tracking/ga4.ts` - Added `trackGA4ViewCheckout()` and `trackGA4PaymentClick()`
- `src/lib/tracking/index.ts` - Exported new tracking functions

### Pages
- `src/routes/checkout/+page.svelte` - New checkout page with form and Przelewy24 button
- `src/routes/cart/+page.svelte` - Updated to navigate to checkout instead of fake door

### Configuration
- `src/lib/config/routes.ts` - Added `/checkout` route
- `src/lib/config/seo.ts` - Added checkout SEO metadata
- `messages/pl.json` & `messages/en.json` - Added checkout translations
- `static/robots.txt` - Excluded /checkout/ from indexing

### Assets
- `static/assets/Przelewy24_logo.png` - Payment provider logo
