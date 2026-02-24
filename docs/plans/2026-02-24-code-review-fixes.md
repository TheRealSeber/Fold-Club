# Code Review Fixes — Plan Patch

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical, high, and significant medium-severity issues found during code review of the tracking data loss prevention plan. These patches must be applied BEFORE or DURING execution of the parent plan.

**Parent Plans:**
- `docs/plans/2026-02-21-tracking-data-loss-prevention.md` (main plan)
- `docs/plans/2026-02-24-fix-event-id-security.md` (event ID fix)

---

## Execution Order

Apply these fixes **inline** as you execute the parent plan. Each fix references which parent task it modifies.

---

### Fix 1: Remove Unnecessary `jsonb` Import (Patches Parent Task 1)

**Severity:** CRITICAL — misleading instruction, unused import

**File:** `src/lib/server/db/schema.ts`

**What to do:** When implementing parent Task 1, do NOT add the `jsonb` import. All required types (`uuid`, `text`, `boolean`, `timestamp`, `index`, `check`) are already imported in the current schema file. No new imports are needed for the new tables.

**Also:** Insert the new `orders` columns after the `currency` column (line 123) and BEFORE the `updatedAt` column (line 124). The parent plan says "after the `currency` column" which is correct, but be precise — the columns go here:

```typescript
    currency: text('currency').notNull().default('PLN'),
    // >>> NEW COLUMNS GO HERE <<<
    trackingSessionId: uuid('tracking_session_id').references(() => trackingSessions.id, { onDelete: 'set null' }),
    fbclid: text('fbclid'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    eventId: text('event_id'),
    // >>> END NEW COLUMNS <<<
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
```

> **Note:** `trackingSessions` must be defined BEFORE `orders` in the file since `orders` now references it. Move the tracking tables section above the orders section, or use a forward-reference pattern.

**Commit:** Include with parent Task 1 commit.

---

### Fix 2: Re-Add Dropped Exports in Unified Module (Patches Parent Task 13)

**Severity:** CRITICAL — build will break without this

**File:** `src/lib/tracking/index.ts`

**What to do:** When implementing parent Task 13, the new `index.ts` MUST re-export these functions that are still consumed by existing files:

```typescript
// These are still imported by src/routes/checkout/+page.svelte
export { trackGA4ViewCheckout, trackGA4PaymentClick } from './ga4';
```

The full exports section should be:

```typescript
export { initMetaPixel, trackMetaPageView } from './meta-pixel';
export { initGA4, trackGA4PageView, trackGA4ViewCheckout, trackGA4PaymentClick } from './ga4';
export { consent } from './consent.svelte';
```

**Commit:** Include with parent Task 13 commit.

---

### Fix 3: Add ViewContent Tracking on Product Page Mount (NEW TASK — after Parent Task 13)

**Severity:** CRITICAL — without this, users arriving from Meta ads to product URLs get zero ViewContent tracking (both client and server)

**File:** `src/routes/products/[slug]/+page.svelte`

**Step 1: Add `onMount` to fire ViewContent**

The current file imports `trackAddToCart` but NOT `trackProductView`, and has no mount-time tracking. A user clicking a Meta ad that links to `/products/fox-mask` gets no ViewContent event at all.

Add to the `<script>` block:

```typescript
import { onMount } from 'svelte';
import { trackAddToCart, trackProductView } from '$lib/tracking';

// ... existing code ...

onMount(() => {
  if (product) {
    trackProductView(product.id, product.name, product.priceAmount);
  }
});
```

The full updated `<script>` block becomes:

```typescript
<script lang="ts">
  import { onMount } from 'svelte';
  import { formatPrice } from '$lib/utils/format';
  import { m } from '$lib/paraglide/messages';
  import { cart } from '$lib/stores/cart.svelte';
  import { trackAddToCart, trackProductView } from '$lib/tracking';

  let { data } = $props();
  let { product, seoTitle, seoDescription } = $derived(data);

  const difficultyLabels = {
    easy: m.product_difficulty_easy,
    medium: m.product_difficulty_medium,
    hard: m.product_difficulty_hard
  };
  const timeLabels = {
    '1-2': m.product_time_1_2,
    '2-3': m.product_time_2_3,
    '3-4': m.product_time_3_4
  };

  onMount(() => {
    if (product) {
      trackProductView(product.id, product.name, product.priceAmount);
    }
  });

  function handleAddToCart() {
    trackAddToCart(product.id, product.name, product.priceAmount);
    cart.addToCart(product.id);
  }
</script>
```

**Step 2: Verify types**

Run: `bun run check`

**Step 3: Commit**

```bash
git add src/routes/products/[slug]/+page.svelte
git commit -m "feat: fire ViewContent tracking on product page mount"
```

---

### Fix 4: Verify Remote Function Import Chain (Patches Parent Task 8 & 13)

**Severity:** CRITICAL — may break build if SvelteKit can't tree-shake server imports

**What to do:** After implementing parent Task 8 (tracking.remote.ts) and Task 13 (index.ts), run a FULL BUILD, not just type check:

```bash
bun run build
```

If the build fails with errors like "Cannot import $lib/server/* in client code", replace the static imports in `index.ts` with dynamic imports:

```typescript
// If static import fails, use this pattern instead:

export function trackProductView(productId: string, productName: string, price: number): void {
  const eventId = generateEventId();
  const sourceUrl = browser ? window.location.href : '';

  // Client-side (synchronous)
  trackMetaViewContent(productId, productName, price, eventId);
  trackGA4ViewItem(productId, productName, price);

  // Server-side (dynamic import, fire-and-forget)
  if (browser) {
    import('./tracking.remote').then(({ track_view_content }) => {
      track_view_content({ productId, productName, price, eventId, sourceUrl }).catch(() => {});
    }).catch(() => {});
  }
}
```

Apply the same dynamic import pattern to `trackAddToCart` and `trackCheckoutClick` if needed.

**Step:** Run `bun run build` after Task 13. If it passes, no changes needed. If it fails, apply the dynamic import pattern above.

**Commit:** Include with parent Task 13 commit.

---

### Fix 5: Normalize GA4 Value Units — Grosze to PLN (NEW TASK — after Parent Task 12)

**Severity:** HIGH — GA4 reports values 100x inflated (9900 instead of 99.00)

**File:** `src/lib/tracking/ga4.ts`

**Context:** Products store `priceAmount` in grosze (minor units): `9900 = 99 PLN`. The Meta Pixel (Task 12) and Meta CAPI (Task 6) both divide by 100. But GA4 functions pass the raw grosze value. GA4 expects major currency units.

**Step 1: Fix all GA4 functions that receive `value`**

Update `trackGA4AddToCart`:
```typescript
export function trackGA4AddToCart(productId: string, itemName: string, value: number): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    currency: 'PLN',
    value: value / 100,
    items: [
      {
        item_id: productId.toString(),
        item_name: itemName,
        price: value / 100,
        quantity: 1
      }
    ]
  });
}
```

Update `trackGA4ViewItem`:
```typescript
export function trackGA4ViewItem(productId: string, itemName: string, value: number): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'view_item', {
    currency: 'PLN',
    value: value / 100,
    items: [
      {
        item_id: productId.toString(),
        item_name: itemName,
        price: value / 100,
        quantity: 1
      }
    ]
  });
}
```

Update `trackGA4BeginCheckout`:
```typescript
export function trackGA4BeginCheckout(
  items: Array<{ id: string; name: string; price: number; quantity: number }>,
  value: number
): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'begin_checkout', {
    currency: 'PLN',
    value: value / 100,
    items: items.map((item, index) => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price / 100,
      quantity: item.quantity,
      index: index
    }))
  });
}
```

Update `trackGA4ViewCheckout`:
```typescript
export function trackGA4ViewCheckout(
  items: Array<{ id: string; name: string; price: number; quantity: number }>,
  value: number
): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'view_checkout', {
    currency: 'PLN',
    value: value / 100,
    items: items.map((item, index) => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price / 100,
      quantity: item.quantity,
      index: index
    }))
  });
}
```

Update `trackGA4PaymentClick`:
```typescript
export function trackGA4PaymentClick(
  items: Array<{ id: string; name: string; price: number; quantity: number }>,
  value: number
): void {
  if (!browser || !window.gtag) return;

  window.gtag('event', 'add_payment_info', {
    currency: 'PLN',
    value: value / 100,
    payment_type: 'przelewy24',
    items: items.map((item, index) => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price / 100,
      quantity: item.quantity,
      index: index
    }))
  });

  const productIds = items.map((item) => item.id);
  trackGA4FakeDoor('payment_click', productIds);
}
```

**Step 2: Verify types**

Run: `bun run check`

**Step 3: Commit**

```bash
git add src/lib/tracking/ga4.ts
git commit -m "fix: normalize GA4 values from grosze to PLN (divide by 100)"
```

---

### Fix 6: Keep `trackGA4FakeDoor` Calls Until Explicit Deprecation (Patches Parent Task 13)

**Severity:** HIGH — silently removes existing funnel tracking data

**File:** `src/lib/tracking/index.ts`

**What to do:** When implementing parent Task 13, do NOT remove the `trackGA4FakeDoor` calls from the unified functions. Keep them until the fake-door flow is explicitly replaced by real Stripe checkout.

The `trackAddToCart` function should include:
```typescript
import { trackGA4FakeDoor } from './ga4';

export function trackAddToCart(productId: string, productName: string, price: number): void {
  const eventId = generateEventId();
  const sourceUrl = browser ? window.location.href : '';

  // Client-side
  trackMetaAddToCart(productId, productName, price, eventId);
  trackGA4AddToCart(productId, productName, price);
  trackGA4FakeDoor('add_to_cart', [productId]);

  // Server-side
  track_add_to_cart({ productId, productName, price, eventId, sourceUrl }).catch(() => {});
}
```

Similarly keep `trackGA4FakeDoor('checkout', productIds)` in `trackCheckoutClick`.

**When to remove:** When the Stripe checkout plan (`docs/plans/2026-02-15-stripe-checkout.md`) is implemented. At that point, create a separate commit: `chore: remove fake-door tracking (replaced by real checkout)`.

**Commit:** Include with parent Task 13 commit.

---

### Fix 7: Document Consent Store SSR Limitation (Patches Parent Task 9)

**Severity:** HIGH — shared state across SSR requests

**File:** `src/lib/tracking/consent.svelte.ts`

**What to do:** When implementing parent Task 9, add a comment at the top of the store:

```typescript
/**
 * Consent State — Svelte 5 Runes Store
 * Manages GDPR cookie consent with reactive state.
 *
 * SSR WARNING: This module-scope singleton is shared across all server
 * requests during SSR. The store reads from cookies (client-side only)
 * and returns null state on the server. ONLY read consent state in
 * client-side contexts ($effect, onMount, event handlers).
 * NEVER use consent.hasConsented in server-rendered template conditionals.
 */
```

**Commit:** Include with parent Task 9 commit.

---

### Fix 8: Add Path Filter to Hooks (Patches Parent Task 4)

**Severity:** MEDIUM — unnecessary DB queries on static asset requests

**File:** `src/hooks.server.ts`

**What to do:** When implementing parent Task 4, add a path filter to the tracking handler:

```typescript
const handleTracking: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // Skip non-page requests: static assets, API routes, internal SvelteKit routes
  if (
    path.startsWith('/_app/') ||
    path.startsWith('/api/') ||
    path.includes('.')
  ) {
    return resolve(event);
  }

  try {
    await captureTrackingParams(event);
  } catch (error) {
    console.error('[tracking] param capture failed:', error);
  }
  return resolve(event);
};
```

**Commit:** Include with parent Task 4 commit.

---

### Fix 9: Use `Promise.allSettled` in ServerTracker (Patches Parent Task 7)

**Severity:** MEDIUM — sequential platform calls add latency

**File:** `src/lib/tracking/server/tracker.ts`

**What to do:** When implementing parent Task 7, replace the sequential `for` loop with parallel execution:

```typescript
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
```

Changes:
1. `Promise.allSettled` instead of sequential `for` loop — platforms fire in parallel
2. Method type narrowed to `Exclude<keyof TrackingPlatform, 'name'>` — prevents accidentally passing `'name'` as a method

**Commit:** Include with parent Task 7 commit.

---

### Fix 10: Add `secure` Flag to Consent Cookie (Patches Parent Task 9)

**Severity:** MEDIUM — consent cookie sent over HTTP in production

**File:** `src/lib/tracking/consent.svelte.ts`

**What to do:** When implementing parent Task 9, update `writeToCookie`:

```typescript
function writeToCookie(state: ConsentState): void {
  if (!browser) return;
  const value = encodeURIComponent(JSON.stringify(state));
  const secure = location.protocol === 'https:' ? ';secure' : '';
  document.cookie = `${COOKIE_NAME}=${value};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax${secure}`;
}
```

**Commit:** Include with parent Task 9 commit.

---

### Fix 11: Auto-Hide Banner on Consent Save (Patches Parent Task 14)

**Severity:** MEDIUM — banner stays visible after saving from footer reopen

**File:** `src/lib/tracking/consent.svelte.ts`

**What to do:** When implementing parent Task 14's additions to the consent store, have the `apply()` method automatically hide the banner:

```typescript
function apply(newState: ConsentState): void {
  state = newState;
  bannerVisible = false;  // Auto-hide after any consent action
  writeToCookie(newState);
  persistToServer(newState);
}
```

This way, `grantAll()`, `rejectAll()`, and `update()` all auto-hide the banner. No need for the `ConsentBanner` component to call `hideBanner()` separately.

**Commit:** Include with parent Task 14 commit.

---

### Fix 12: Split Tracking Init into Separate Effects (Patches Parent Task 11)

**Severity:** MEDIUM — cross-triggering and no teardown documentation

**File:** `src/routes/+layout.svelte`

**What to do:** When implementing parent Task 11, use two separate effects instead of one combined block. Also document the teardown limitation:

```typescript
import { consent } from '$lib/tracking/consent.svelte';

// Initialize Meta Pixel when marketing consent is granted
// Note: Once loaded, scripts persist until page reload.
// Revoking consent stops NEW events from firing but does not unload the script.
$effect(() => {
  if (browser && consent.marketing) {
    initMetaPixel();
  }
});

// Initialize GA4 when analytics consent is granted
$effect(() => {
  if (browser && consent.analytics) {
    initGA4();
  }
});

// Track page views on navigation (consent-gated)
$effect(() => {
  if (browser && page.url) {
    if (consent.marketing) {
      trackMetaPageView();
    }
    if (consent.analytics) {
      trackGA4PageView(page.url.pathname, document.title);
    }
  }
});
```

**Commit:** Include with parent Task 11 commit.

---

### Fix 13: Update Design Document (Patches Design Doc)

**Severity:** LOW — documentation accuracy

**File:** `docs/plans/2026-02-21-tracking-data-loss-prevention-design.md`

**Step 1: Fix event trigger table**

Replace:
```markdown
| InitiateCheckout | Checkout page mount | `track_checkout` command() |
```
With:
```markdown
| InitiateCheckout | Cart page checkout button click | `track_checkout` command() |
```

**Step 2: Fix relationship diagram**

Replace:
```markdown
tracking_sessions (1) ←── (1)    orders (via tracking_session_id)
```
With:
```markdown
tracking_sessions (1) ←── (many) orders (via tracking_session_id)
```

**Step 3: Add patch note at top**

After the header, add:
```markdown
> **Patches applied:**
> - `docs/plans/2026-02-24-fix-event-id-security.md` — Random event IDs instead of session-based
> - `docs/plans/2026-02-24-code-review-fixes.md` — Critical/high/medium fixes from code review
```

**Step 4: Commit**

```bash
git add docs/plans/2026-02-21-tracking-data-loss-prevention-design.md
git commit -m "docs: apply code review fixes to tracking design document"
```

---

### Fix 14: Add Patch Notes to Parent Implementation Plan

**File:** `docs/plans/2026-02-21-tracking-data-loss-prevention.md`

**Step 1: Add patch note after the header**

After line 11 (`**Design Doc:**...`), add:

```markdown
> **Patches applied:** Execute alongside `docs/plans/2026-02-24-code-review-fixes.md` which fixes critical/high/medium issues found during code review. Also apply `docs/plans/2026-02-24-fix-event-id-security.md` for event ID security fix.
```

**Step 2: Commit**

```bash
git add docs/plans/2026-02-21-tracking-data-loss-prevention.md
git commit -m "docs: add patch references to parent tracking plan"
```

---

## Summary — Fixes by Parent Task

| Parent Task | Fixes to Apply |
|-------------|---------------|
| Task 1 (Schema) | Fix 1: No jsonb import, precise column insertion point, table ordering |
| Task 4 (Hooks) | Fix 8: Path filter for non-page requests |
| Task 7 (ServerTracker) | Fix 9: `Promise.allSettled` + narrowed method type |
| Task 8 (Remote Functions) | Fix 4: Run `bun run build` to verify import chain |
| Task 9 (Consent Store) | Fix 7: SSR warning comment, Fix 10: `secure` cookie flag |
| Task 11 (Layout) | Fix 12: Separate `$effect` blocks, teardown docs |
| Task 12 (Meta Pixel Dedup) | Fix 5: Also fix GA4 values in same batch |
| Task 13 (Unified Module) | Fix 2: Re-add dropped exports, Fix 4: Dynamic import fallback, Fix 6: Keep fake-door calls |
| NEW after Task 13 | Fix 3: ViewContent on product page mount |
| Task 14 (Footer Link) | Fix 11: Auto-hide banner on save |
| Docs only | Fix 13: Design doc corrections, Fix 14: Patch notes |

## Recommended Full Execution Order

1. Task 1 + Fix 1 (Schema)
2. Task 2 + Event ID security fix plan (Dedup)
3. Task 3 (Capture Params)
4. Task 4 + Fix 8 (Hooks)
5. Task 5 (Types)
6. Task 6 (Meta CAPI)
7. Task 7 + Fix 9 (ServerTracker)
8. Task 8 (Remote Functions) — run `bun run build` after
9. Task 9 + Fix 7 + Fix 10 (Consent Store)
10. Task 10 (Consent Banner)
11. Task 11 + Fix 12 (Layout)
12. Task 12 + Fix 5 (Meta Pixel Dedup + GA4 Values)
13. Task 13 + Fix 2 + Fix 4 + Fix 6 (Unified Module)
14. **Fix 3** (ViewContent on product page mount — NEW)
15. Task 14 + Fix 11 (Footer Link)
16. Task 15 (Env Vars)
17. Fix 13 + Fix 14 (Documentation patches)
18. Task 16 (Manual Verification)
