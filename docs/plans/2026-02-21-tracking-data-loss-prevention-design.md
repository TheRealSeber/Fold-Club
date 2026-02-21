# Tracking Data Loss Prevention — Design Document

> **Date:** 2026-02-21
> **Status:** Approved
> **Goal:** Prevent tracking data loss by implementing dual-layer tracking (client-side Pixel + server-side Conversions API) with GDPR-compliant consent management, modular multi-platform architecture, and full-funnel event coverage.

---

## Problem Statement

The current Fold Club tracking implementation relies solely on client-side Meta Pixel and GA4. Due to iOS 14+ ATT opt-outs, ad blockers, and browser privacy restrictions, ~60% of conversions are invisible to Meta's algorithm. This means:

- Meta optimizes ad delivery on incomplete data
- ROAS appears lower than reality (under-investment in winning campaigns)
- CPA appears higher than reality (killing profitable campaigns too early)
- Retargeting pools are smaller than they should be

## Solution Overview

**Dual-layer tracking:** Client-side Pixel captures behavioral signals (for ~40% of users without blockers), server-side Conversions API guarantees conversion tracking (for 100% of backend events). Event deduplication prevents double-counting.

**Architecture:** Modular `ServerTracker` orchestrator with platform adapters (`MetaCapi` now, `GoogleAdsApi`/`TikTokEventsApi` later). Full-funnel events: ViewContent, AddToCart, InitiateCheckout, Purchase.

**Tech approach:** SvelteKit remote functions (`command()`) for client-initiated server tracking, `hooks.server.ts` for URL parameter capture, Svelte 5 runes for consent state management.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Page Load] → Capture fbclid/UTM params → Store in session     │
│       ↓                                                          │
│  [Consent Banner] → User chooses: Marketing/Analytics/Necessary │
│       ↓                                                          │
│  IF Marketing Consent = YES:                                     │
│    → Initialize Meta Pixel (fbq)                                │
│    → Initialize GA4 (gtag)                                       │
│       ↓                                                          │
│  [User Actions]:                                                 │
│    ViewContent → fbq('track', 'ViewContent', {eventID: 'xxx'})  │
│    AddToCart   → fbq('track', 'AddToCart', {eventID: 'yyy'})   │
│    Checkout    → fbq('track', 'InitiateCheckout', {eventID})   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SVELTEKIT SERVER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [hooks.server.ts]:                                              │
│    → Extract fbclid, UTMs, ip, userAgent from request           │
│    → Create/update tracking_sessions in database                │
│    → Set fc_session cookie (30 day expiry)                      │
│                                                                  │
│  [Remote Functions - tracking.remote.ts]:                        │
│    → track_view_content  command()                              │
│    → track_add_to_cart   command()                              │
│    → track_checkout      command()                              │
│    → save_consent        command()                              │
│                                                                  │
│  [ServerTracker Orchestrator]:                                   │
│    → Reads tracking session (fbclid, fbc, fbp, consent)        │
│    → Fires event on all registered platforms                    │
│    → Non-blocking: failures logged, never break UX             │
│                                                                  │
│  [Stripe Webhook - +server.ts]:                                  │
│    → Create order with attribution data                         │
│    → ServerTracker.trackPurchase()                              │
│                                                                  │
│  Event Deduplication:                                            │
│    Client sends eventID → Server uses SAME eventID              │
│    Meta deduplicates by event_name + event_id (48h window)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      META CONVERSIONS API                        │
│  https://graph.facebook.com/v21.0/{pixel-id}/events            │
│                                                                  │
│  Receives:                                                       │
│    - Client Pixel events (~40% of users)                       │
│    - Server API events (100% of conversions)                   │
│    - Deduplicates by event_id                                  │
│    - Attributes conversions back to ads via fbclid/fbc/fbp     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `tracking_sessions` table (NEW)

Captures attribution data on first visit, persists until conversion or expiry.

```sql
tracking_sessions
├── id             UUID (PK, UUIDv7)
├── session_id     TEXT (unique, generated on first visit, stored in cookie)
├── fbclid         TEXT (nullable)
├── fbc            TEXT (nullable, Meta click cookie)
├── fbp            TEXT (nullable, Meta browser cookie)
├── gclid          TEXT (nullable, Google click ID - future)
├── ttclid         TEXT (nullable, TikTok click ID - future)
├── utm_source     TEXT (nullable)
├── utm_medium     TEXT (nullable)
├── utm_campaign   TEXT (nullable)
├── utm_content    TEXT (nullable)
├── utm_term       TEXT (nullable)
├── ip_address     TEXT (nullable, for Meta CAPI user_data)
├── user_agent     TEXT (nullable, for Meta CAPI user_data)
├── landing_page   TEXT (nullable, first URL they visited)
├── created_at     TIMESTAMP
├── expires_at     TIMESTAMP (30 days from creation)
```

### `consent_records` table (NEW, 3NF)

Audit trail of consent changes. One-to-many with tracking_sessions.

```sql
consent_records
├── id              UUID (PK, UUIDv7)
├── session_id      TEXT (FK → tracking_sessions.session_id)
├── necessary       BOOLEAN (always true)
├── analytics       BOOLEAN
├── marketing       BOOLEAN
├── created_at      TIMESTAMP
```

Latest consent per session:
```sql
SELECT * FROM consent_records
WHERE session_id = 'xxx'
ORDER BY created_at DESC
LIMIT 1;
```

### `orders` table (MODIFIED)

Add attribution columns (copied from tracking_sessions at purchase time for fast queries):

```sql
orders (existing columns +)
+ tracking_session_id   UUID (FK → tracking_sessions.id, nullable)
+ fbclid                TEXT (nullable)
+ utm_source            TEXT (nullable)
+ utm_medium            TEXT (nullable)
+ utm_campaign          TEXT (nullable)
+ event_id              TEXT (nullable, for deduplication)
```

### Relationships

```
tracking_sessions (1) ←── (many) consent_records
tracking_sessions (1) ←── (1)    orders (via tracking_session_id)
```

---

## Consent Management

### Consent Flow

```
User visits site
    ↓
Has fc_consent cookie? ──yes──→ Load tracking per stored preferences
    ↓ no
Show ConsentBanner (bottom bar, brutalist design)
    ↓
User chooses:
  [Accept All] → {necessary: true, analytics: true, marketing: true}
  [Reject All] → {necessary: true, analytics: false, marketing: false}
  [Customize]  → Opens panel with toggles per category
    ↓
Store consent:
  1. Set cookie: fc_consent={necessary:true,analytics:true,marketing:false}
  2. POST to server via save_consent command() → Insert row in consent_records
  3. Initialize/teardown tracking scripts based on choices
```

### Consent Banner UI

Styled with `brutal-card`, `paper-shadow-lg`, `border-3 border-ink`, no rounded corners.

**Default view:** Bottom bar with "We use cookies..." message + [Customize] [Reject All] [Accept All] buttons.

**Expanded view:** Panel with toggles for Necessary (always active), Analytics, Marketing + [Save Preferences] button.

**Footer link:** "Cookie Settings" reopens consent panel. Creates new `consent_records` row on change.

### Consent State (Svelte 5 Runes)

```typescript
// src/lib/tracking/consent.svelte.ts
// $state() rune store
// Reads from cookie on init
// Updates cookie + POSTs to server on change
// Exposes: consent.marketing, consent.analytics, consent.hasConsented
// Methods: grantAll(), rejectAll(), update(partial)
```

### Tracking Initialization Based on Consent

```typescript
// In +layout.svelte
$effect(() => {
  if (consent.marketing) {
    initMetaPixel();
  }
  if (consent.analytics) {
    initGA4();
  }
});
```

Server-side events also check consent before firing.

---

## URL Parameter Capture

### Capture Point: `hooks.server.ts`

Runs on every server request, before any page load function. Has access to URL params, cookies, and request headers. Can set cookies.

### Captured Parameters

| Source | Parameters |
|--------|-----------|
| URL query params | `fbclid`, `gclid`, `ttclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` |
| Request headers | `ip_address`, `user_agent` |
| Cookies | `_fbc` (Meta click), `_fbp` (Meta browser) |
| Request URL | `landing_page` (path) |

### Session Management

- Generate `session_id` on first visit → set `fc_session` cookie (30 day expiry)
- If `fc_session` cookie exists, update session if new params present
- If no params and session exists, just read existing session

### Edge Cases

1. **Organic visit (no params):** Session created with null attribution. Updated if user later returns via ad.
2. **Multiple ad clicks:** Last-click attribution — session updated with latest params.
3. **`_fbc`/`_fbp` not yet set on first load:** Meta Pixel sets them client-side. Next server request reads and updates session.
4. **Ad blocker blocks Pixel:** `fbclid` still captured from URL server-side. Meta CAPI can construct `fbc` from `fbclid` + timestamp.

---

## Server-Side Tracking Layer

### Platform Abstraction

```typescript
interface TrackingPlatform {
  name: string;
  sendViewContent(params: ViewContentParams): Promise<void>;
  sendAddToCart(params: AddToCartParams): Promise<void>;
  sendInitiateCheckout(params: CheckoutParams): Promise<void>;
  sendPurchase(params: PurchaseParams): Promise<void>;
}

class ServerTracker {
  private platforms: TrackingPlatform[] = [];
  register(platform: TrackingPlatform): void;
  async trackViewContent(params, session): Promise<void>;
  async trackAddToCart(params, session): Promise<void>;
  async trackInitiateCheckout(params, session): Promise<void>;
  async trackPurchase(params, session): Promise<void>;
}
```

### MetaCapi Adapter

Sends events to `https://graph.facebook.com/v21.0/{pixel-id}/events` with:
- `event_name`, `event_id` (dedup), `event_time`, `event_source_url`
- `action_source: 'website'`
- `user_data`: SHA256-hashed email, `client_ip_address`, `client_user_agent`, `fbc`, `fbp`, `fbclid`
- `custom_data`: `value`, `currency: 'PLN'`, `content_ids`, `content_type: 'product'`

### Remote Functions (tracking.remote.ts)

Uses SvelteKit `command()` from `$app/server`:
- `track_view_content` — called from product pages
- `track_add_to_cart` — called from add-to-cart handlers
- `track_checkout` — called from checkout page
- `save_consent` — called from ConsentBanner

Each command reads `fc_session` cookie via `getRequestEvent()`, looks up tracking session, checks consent, fires server events.

### Event Trigger Points

| Event | Client Trigger | Server Trigger |
|-------|---------------|----------------|
| ViewContent | Product page mount | `track_view_content` command() |
| AddToCart | Cart button click | `track_add_to_cart` command() |
| InitiateCheckout | Checkout page mount | `track_checkout` command() |
| Purchase | Success page mount (optional) | Stripe webhook |

---

## Event Deduplication

### Strategy: Deterministic Event IDs

Both client and server independently generate the same event ID:

```
{eventName}_{entityId}_{sessionId}_{date}
```

Examples:
- `AddToCart_prod_abc123_sess_xyz_2026-02-21`
- `Purchase_order_def456_sess_xyz_2026-02-21`

Meta deduplicates by matching `event_name` + `event_id` within 48-hour window.

### Per Event Type

| Event | Entity ID | Dedup Needed? |
|-------|-----------|---------------|
| ViewContent | productId | Yes |
| AddToCart | productId | Yes |
| InitiateCheckout | sessionId | Yes |
| Purchase | orderId / stripeSessionId | Only if success page fires Pixel |

---

## Error Handling

### Guiding Principle

Tracking failures must NEVER break the user experience.

### Strategy

- **hooks.server.ts:** Try/catch around param capture. If it fails, request continues normally.
- **Remote functions:** Try/catch inside command handlers. Return `{ tracked: true }` regardless.
- **ServerTracker:** 3-second timeout per platform. Failures logged, continues to next platform.
- **Stripe webhook:** Order creation and tracking are separate. Order insert is transactional. Tracking fires outside transaction as best-effort.

### Graceful Degradation

```
Best case:  Client Pixel + Server CAPI = Full tracking
Normal:     No Pixel + Server CAPI = Server covers it
Degraded:   Client Pixel + No CAPI = Pixel covers it
Worst case: No Pixel + No CAPI = No tracking (user still shops fine)
```

### YAGNI

No retry queue, no dead letter storage, no health check dashboard, no alerting system. Console errors are sufficient at current scale.

---

## File Structure

```
src/
├── hooks.server.ts                          MODIFIED
├── lib/
│   ├── tracking/
│   │   ├── index.ts                         MODIFIED
│   │   ├── meta-pixel.ts                    MODIFIED (add eventID)
│   │   ├── ga4.ts                           EXISTING (no changes)
│   │   ├── consent.svelte.ts                NEW
│   │   ├── dedup.ts                         NEW
│   │   ├── capture-params.ts                NEW
│   │   ├── tracking.remote.ts               NEW
│   │   └── server/
│   │       ├── tracker.ts                   NEW
│   │       ├── meta-capi.ts                 NEW
│   │       └── types.ts                     NEW
│   ├── components/
│   │   └── tracking/
│   │       └── ConsentBanner.svelte         NEW
│   └── server/
│       └── db/
│           └── schema.ts                    MODIFIED
├── routes/
│   ├── +layout.svelte                       MODIFIED
│   └── api/
│       └── webhooks/
│           └── stripe/
│               └── +server.ts               FUTURE (purchase tracking)
```

## Environment Variables

```bash
# Add to .env
META_CAPI_ACCESS_TOKEN="your-meta-capi-token"   # Server-only

# Already exist
PUBLIC_META_PIXEL_ID="4349963781944006"
PUBLIC_GA4_MEASUREMENT_ID="G-LJTE4F48YJ"
```

`META_CAPI_ACCESS_TOKEN` obtained from Meta Events Manager → Settings → Conversions API → Generate Access Token.
