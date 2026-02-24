# Fix Event ID Security — Plan Patch

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the session-based deterministic event ID strategy with client-generated random UUIDs. This eliminates the need for the client to read the session cookie, removes the `fc_session_id` dual-cookie security hole, and simplifies the deduplication architecture.

**Architecture:** The client generates a `crypto.randomUUID()` for each user action and passes the same ID to both the client-side Pixel call and the server-side remote function. No shared state needed between client and server for dedup. The `fc_session` cookie stays httpOnly (server-only).

**Tech Stack:** Web Crypto API (`crypto.randomUUID()`), SvelteKit remote functions.

**Parent Plan:** `docs/plans/2026-02-21-tracking-data-loss-prevention.md`

---

## Context: What's Wrong

The original plan's `dedup.ts` had:

```typescript
// WRONG: Client can't read httpOnly cookies
function getSessionIdFromCookie(): string {
  const match = document.cookie.match(/(?:^|;\s*)fc_session=([^;]*)/);
  return match?.[1] ?? 'unknown';
}

// WRONG: Deterministic IDs require shared session state
function generateEventId(eventName, entityId, sessionId): string {
  return `${eventName}_${entityId}_${sessionId}_${date}`;
}
```

Problems:
1. `fc_session` is httpOnly — `document.cookie` can't read it → always returns `'unknown'`
2. A non-httpOnly `fc_session_id` copy was proposed as a fix, but this leaks the session ID to XSS attacks while providing zero security benefit (same value in both cookies)
3. The entire approach is over-engineered — the client doesn't need the session ID at all

## Fix: Random Event IDs

The client generates a random UUID per event and passes it to both Pixel and CAPI. No session access needed.

---

### Task 1: Rewrite `dedup.ts` — Remove Session Dependency

**Files:**
- Modify: `src/lib/tracking/dedup.ts` (from parent plan Task 2)

**Step 1: Replace the entire file with this simplified version**

```typescript
/**
 * Event Deduplication
 * Generates random event IDs for client-server deduplication.
 * Both client Pixel and server CAPI receive the same ID from the caller.
 * Meta deduplicates by event_name + event_id within 48h window.
 */

/**
 * Generate a unique event ID for deduplication.
 * Called once per user action — the same ID is passed to both
 * the client-side Pixel and the server-side remote function.
 */
export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
```

**What changed:**
- Removed `getSessionIdFromCookie()` entirely
- Removed `eventName`, `entityId`, `sessionId` parameters
- Uses `crypto.randomUUID()` (available in all modern browsers and Node 19+/Bun)
- No dependency on cookies or session state

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/dedup.ts
git commit -m "fix: replace session-based event IDs with crypto.randomUUID()"
```

---

### Task 2: Update `capture-params.ts` — Remove Dual-Cookie

**Files:**
- Modify: `src/lib/tracking/capture-params.ts` (from parent plan Task 3)

**Step 1: Ensure only ONE cookie is set, and it's httpOnly**

In the `captureTrackingParams` function, verify the cookie is set as:

```typescript
event.cookies.set(SESSION_COOKIE, sessionId, {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: true,
  maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
});
```

**What to verify:**
- There is NO second cookie being set (no `fc_session_id`)
- There is NO non-httpOnly cookie with the session ID
- Only `fc_session` exists, and it's httpOnly

If a `fc_session_id` cookie or any non-httpOnly session cookie exists, remove it.

**Step 2: Commit (if changes were needed)**

```bash
git add src/lib/tracking/capture-params.ts
git commit -m "fix: ensure fc_session is httpOnly only, remove any non-httpOnly copy"
```

---

### Task 3: Update `index.ts` — Use Random Event IDs

**Files:**
- Modify: `src/lib/tracking/index.ts` (from parent plan Task 13)

**Step 1: Update all unified tracking functions**

The import changes from:
```typescript
// OLD
import { generateEventId, getSessionIdFromCookie } from './dedup';
```

To:
```typescript
// NEW
import { generateEventId } from './dedup';
```

Each unified function changes from:
```typescript
// OLD
const sessionId = getSessionIdFromCookie();
const eventId = generateEventId('AddToCart', productId, sessionId);
```

To:
```typescript
// NEW
const eventId = generateEventId();
```

Apply this to all three functions:

**`trackProductView`:**
```typescript
export function trackProductView(productId: string, productName: string, price: number): void {
  const eventId = generateEventId();
  const sourceUrl = browser ? window.location.href : '';

  // Client-side
  trackMetaViewContent(productId, productName, price, eventId);
  trackGA4ViewItem(productId, productName, price);

  // Server-side (fire-and-forget)
  track_view_content({ productId, productName, price, eventId, sourceUrl }).catch(() => {});
}
```

**`trackAddToCart`:**
```typescript
export function trackAddToCart(productId: string, productName: string, price: number): void {
  const eventId = generateEventId();
  const sourceUrl = browser ? window.location.href : '';

  // Client-side
  trackMetaAddToCart(productId, productName, price, eventId);
  trackGA4AddToCart(productId, productName, price);

  // Server-side (fire-and-forget)
  track_add_to_cart({ productId, productName, price, eventId, sourceUrl }).catch(() => {});
}
```

**`trackCheckoutClick`:**
```typescript
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

  // Server-side (fire-and-forget)
  track_checkout({
    productIds,
    totalValue,
    numItems: items.length,
    eventId,
    sourceUrl,
  }).catch(() => {});
}
```

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/index.ts
git commit -m "fix: use random event IDs instead of session-derived IDs"
```

---

### Task 4: Update Parent Plan Documentation

**Files:**
- Modify: `docs/plans/2026-02-21-tracking-data-loss-prevention.md`

**Step 1: Update Task 2 (Event Deduplication Utility) in the parent plan**

Replace the `dedup.ts` code block in Task 2 with the simplified version from this plan's Task 1.

**Step 2: Update Task 13 (Unified Tracking Module) in the parent plan**

Remove all references to `getSessionIdFromCookie()` and update `generateEventId()` calls to be parameterless.

**Step 3: Add a note at the top of the parent plan**

After the header, add:
```markdown
> **Patch applied:** `docs/plans/2026-02-24-fix-event-id-security.md` — Replaced session-based deterministic event IDs with `crypto.randomUUID()`. Removed `getSessionIdFromCookie()` and any dual-cookie pattern. `fc_session` stays httpOnly (server-only).
```

**Step 4: Commit**

```bash
git add docs/plans/2026-02-21-tracking-data-loss-prevention.md
git commit -m "docs: patch parent plan with event ID security fix"
```

---

## Summary

| Change | Before | After |
|--------|--------|-------|
| `dedup.ts` | `generateEventId(name, entity, session)` + `getSessionIdFromCookie()` | `generateEventId()` → `crypto.randomUUID()` |
| Cookies | `fc_session` (httpOnly) + `fc_session_id` (non-httpOnly) | `fc_session` (httpOnly) only |
| Client cookie access | Reads session ID from `document.cookie` | No cookie access needed |
| XSS exposure | Session ID readable by JS | Nothing sensitive exposed to JS |
| Event ID source | Deterministic from shared state | Random UUID per event |
| Dedup mechanism | Same ID generated independently by client + server | Same ID passed from client to both Pixel + remote function |
