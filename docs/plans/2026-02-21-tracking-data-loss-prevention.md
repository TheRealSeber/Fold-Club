# Tracking Data Loss Prevention — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement dual-layer tracking (client-side Meta Pixel + server-side Conversions API) with GDPR consent management, event deduplication, and modular multi-platform architecture to prevent ~60% tracking data loss from ad blockers and iOS privacy restrictions.

**Architecture:** SvelteKit `hooks.server.ts` captures URL attribution params (fbclid, UTMs) on every request and persists them in `tracking_sessions` table. A `ConsentBanner` component manages GDPR granular consent via Svelte 5 `$state()` runes, stored in `consent_records` table. Client-side events pass deterministic `event_id` for deduplication. SvelteKit remote functions (`command()`) fire server-side events to Meta CAPI via a modular `ServerTracker` orchestrator. Purchase events fire from the Stripe webhook.

**Tech Stack:** SvelteKit 2.49+, Svelte 5 runes, Drizzle ORM + PostgreSQL (Supabase), SvelteKit remote functions (`$app/server`), Meta Conversions API v21.0, TailwindCSS v4 (brutalist design).

**Design Doc:** `docs/plans/2026-02-21-tracking-data-loss-prevention-design.md`

**Required Skills:**
- `@svelte-skills:svelte-runes` — Task 9 (consent store: `$state`, `$derived`), Task 11 (layout: `$effect` for consent-gated init). Invoke before writing any reactive code.
- `@svelte-skills:sveltekit-remote-functions` — Task 8 (tracking remote functions: `command()`, `getRequestEvent()`, Valibot schemas). Invoke before writing `.remote.ts` files.
- `@svelte-skills:sveltekit-structure` — Task 4 (hooks.server.ts: `sequence()` handler chain). Invoke before modifying hooks.
- `@svelte-skills:sveltekit-data-flow` — Task 8 (understanding server/client boundary for remote functions vs load functions).
- `@component` — Task 10 (ConsentBanner.svelte: must follow brutalist design system from `docs/DESIGN_SYSTEM.md` and `src/app.css`). Invoke before creating UI components.
- `svelte-autofixer` MCP tool — Tasks 10, 14 (run on all `.svelte` files before committing).

---

## Pre-requisites (manual, ~5 min)

1. Go to Meta Events Manager → Settings → Conversions API → Generate Access Token
2. Add to `.env`:
   ```
   META_CAPI_ACCESS_TOKEN="your-access-token"
   ```
3. Add to `.env.example`:
   ```
   # Meta Conversions API (server-side)
   # Get from: https://business.facebook.com/events_manager → Settings → Conversions API
   META_CAPI_ACCESS_TOKEN="your-capi-access-token"
   ```

---

### Task 1: Database Schema — Tracking Sessions & Consent Records

**Files:**
- Modify: `src/lib/server/db/schema.ts`

**Step 1: Add `tracking_sessions` table after the existing `orders` / `orderItems` tables**

Add these imports to the existing import block at the top of `schema.ts`:
```typescript
import { jsonb } from 'drizzle-orm/pg-core';
```

Then add after `orderItems`:

```typescript
// ─── Tracking ───────────────────────────────────────────────────────────────

export const trackingSessions = pgTable(
  'tracking_sessions',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    sessionId: text('session_id').notNull().unique(),
    fbclid: text('fbclid'),
    fbc: text('fbc'),
    fbp: text('fbp'),
    gclid: text('gclid'),
    ttclid: text('ttclid'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    utmTerm: text('utm_term'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    landingPage: text('landing_page'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    index('ts_session_id_idx').on(table.sessionId),
    index('ts_expires_at_idx').on(table.expiresAt),
  ]
);

export const consentRecords = pgTable(
  'consent_records',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    sessionId: text('session_id')
      .notNull()
      .references(() => trackingSessions.sessionId, { onDelete: 'cascade' }),
    necessary: boolean('necessary').notNull().default(true),
    analytics: boolean('analytics').notNull().default(false),
    marketing: boolean('marketing').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('cr_session_id_idx').on(table.sessionId),
  ]
);
```

**Step 2: Add tracking columns to `orders` table**

Add these columns to the existing `orders` table definition, after the `currency` column:

```typescript
    trackingSessionId: uuid('tracking_session_id').references(() => trackingSessions.id, { onDelete: 'set null' }),
    fbclid: text('fbclid'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    eventId: text('event_id'),
```

**Step 3: Verify types compile**

Run: `bun run check`

Expected: No errors related to schema.

**Step 4: Push schema to Supabase**

Run: `bun run db:push`

Expected: New tables `tracking_sessions`, `consent_records` created; `orders` table updated with new columns.

**Step 5: Commit**

```bash
git add src/lib/server/db/schema.ts
git commit -m "feat: add tracking_sessions, consent_records tables and order attribution columns"
```

---

### Task 2: Event Deduplication Utility

**Files:**
- Create: `src/lib/tracking/dedup.ts`

**Step 1: Create the dedup module**

```typescript
/**
 * Event Deduplication
 * Generates deterministic event IDs so client Pixel and server CAPI
 * produce the same ID for the same user action.
 * Meta deduplicates by event_name + event_id within 48h window.
 */

/**
 * Generate a deterministic event ID.
 * Same inputs always produce the same ID — client and server can
 * independently generate matching IDs without communicating.
 */
export function generateEventId(
  eventName: string,
  entityId: string,
  sessionId: string
): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${eventName}_${entityId}_${sessionId}_${date}`;
}

/**
 * Read fc_session cookie value from document.cookie (client-side).
 */
export function getSessionIdFromCookie(): string {
  if (typeof document === 'undefined') return 'unknown';
  const match = document.cookie.match(/(?:^|;\s*)fc_session=([^;]*)/);
  return match?.[1] ?? 'unknown';
}
```

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/dedup.ts
git commit -m "feat: add deterministic event ID generation for deduplication"
```

---

### Task 3: URL Parameter Capture Logic

**Files:**
- Create: `src/lib/tracking/capture-params.ts`

**Step 1: Create the capture module**

This is a server-only utility used by `hooks.server.ts`. It extracts attribution params from the request and upserts a tracking session in the database.

```typescript
/**
 * URL Parameter Capture — Server-side only
 * Extracts fbclid, UTM params, IP, user agent from incoming requests.
 * Creates or updates tracking_sessions in the database.
 */

import { db } from '$lib/server/db';
import { trackingSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import type { RequestEvent } from '@sveltejs/kit';

const SESSION_COOKIE = 'fc_session';
const SESSION_EXPIRY_DAYS = 30;

interface CapturedParams {
  fbclid: string | null;
  gclid: string | null;
  ttclid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

function extractParams(url: URL): CapturedParams {
  return {
    fbclid: url.searchParams.get('fbclid'),
    gclid: url.searchParams.get('gclid'),
    ttclid: url.searchParams.get('ttclid'),
    utmSource: url.searchParams.get('utm_source'),
    utmMedium: url.searchParams.get('utm_medium'),
    utmCampaign: url.searchParams.get('utm_campaign'),
    utmContent: url.searchParams.get('utm_content'),
    utmTerm: url.searchParams.get('utm_term'),
  };
}

function hasAnyParam(params: CapturedParams): boolean {
  return Object.values(params).some((v) => v !== null);
}

function getClientIp(event: RequestEvent): string | null {
  return (
    event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    event.request.headers.get('x-real-ip') ??
    null
  );
}

/**
 * Capture tracking parameters from the request.
 * Creates a new tracking session if none exists, or updates existing
 * session if new attribution params are present (last-click attribution).
 */
export async function captureTrackingParams(event: RequestEvent): Promise<void> {
  const existingSessionId = event.cookies.get(SESSION_COOKIE);
  const params = extractParams(event.url);
  const fbc = event.cookies.get('_fbc') ?? null;
  const fbp = event.cookies.get('_fbp') ?? null;
  const ipAddress = getClientIp(event);
  const userAgent = event.request.headers.get('user-agent');

  if (existingSessionId) {
    // Update session if new attribution params arrived (last-click attribution)
    if (hasAnyParam(params) || fbc || fbp) {
      const updateData: Record<string, unknown> = {};
      if (params.fbclid) updateData.fbclid = params.fbclid;
      if (params.gclid) updateData.gclid = params.gclid;
      if (params.ttclid) updateData.ttclid = params.ttclid;
      if (params.utmSource) updateData.utmSource = params.utmSource;
      if (params.utmMedium) updateData.utmMedium = params.utmMedium;
      if (params.utmCampaign) updateData.utmCampaign = params.utmCampaign;
      if (params.utmContent) updateData.utmContent = params.utmContent;
      if (params.utmTerm) updateData.utmTerm = params.utmTerm;
      if (fbc) updateData.fbc = fbc;
      if (fbp) updateData.fbp = fbp;
      if (ipAddress) updateData.ipAddress = ipAddress;
      if (userAgent) updateData.userAgent = userAgent;

      if (Object.keys(updateData).length > 0) {
        await db
          .update(trackingSessions)
          .set(updateData)
          .where(eq(trackingSessions.sessionId, existingSessionId));
      }
    }
    return;
  }

  // Create new session
  const sessionId = uuidv7();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await db.insert(trackingSessions).values({
    sessionId,
    fbclid: params.fbclid,
    fbc,
    fbp,
    gclid: params.gclid,
    ttclid: params.ttclid,
    utmSource: params.utmSource,
    utmMedium: params.utmMedium,
    utmCampaign: params.utmCampaign,
    utmContent: params.utmContent,
    utmTerm: params.utmTerm,
    ipAddress,
    userAgent,
    landingPage: event.url.pathname,
    expiresAt,
  });

  event.cookies.set(SESSION_COOKIE, sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
  });
}

/**
 * Look up a tracking session by session ID.
 * Returns null if not found or expired.
 */
export async function getTrackingSession(sessionId: string | undefined) {
  if (!sessionId) return null;

  const [session] = await db
    .select()
    .from(trackingSessions)
    .where(eq(trackingSessions.sessionId, sessionId))
    .limit(1);

  if (!session) return null;
  if (session.expiresAt < new Date()) return null;

  return session;
}
```

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/capture-params.ts
git commit -m "feat: add URL parameter capture and tracking session management"
```

---

### Task 4: Integrate Parameter Capture into Hooks

> **Skill:** Invoke `@svelte-skills:sveltekit-structure` before starting — covers hooks.server.ts patterns and `sequence()` handler chaining.

**Files:**
- Modify: `src/hooks.server.ts`

**Step 1: Add tracking capture to the existing handle chain**

The current `hooks.server.ts` only has the Paraglide middleware. We need to add the tracking capture as a second handler using SvelteKit's `sequence` helper.

Replace the entire file with:

```typescript
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { captureTrackingParams } from '$lib/tracking/capture-params';

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
    });
  });

const handleTracking: Handle = async ({ event, resolve }) => {
  try {
    await captureTrackingParams(event);
  } catch (error) {
    console.error('[tracking] param capture failed:', error);
  }
  return resolve(event);
};

export const handle: Handle = sequence(handleTracking, handleParaglide);
```

> **Note:** `handleTracking` runs first so that the `fc_session` cookie is set before any page load function runs. The entire block is wrapped in try/catch — tracking failures never break the page.

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/hooks.server.ts
git commit -m "feat: integrate URL parameter capture into server hooks"
```

---

### Task 5: Server-Side Tracking Layer — Types & Interface

**Files:**
- Create: `src/lib/tracking/server/types.ts`

**Step 1: Create the platform interface and shared types**

```typescript
/**
 * Tracking Platform Interface
 * Every ad platform adapter (Meta, Google, TikTok) implements this contract.
 */

export interface UserData {
  email?: string;
  ip?: string | null;
  userAgent?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  fbclid?: string | null;
}

export interface ViewContentParams {
  eventId: string;
  productId: string;
  productName: string;
  value: number;
  currency: string;
  sourceUrl: string;
  userData: UserData;
}

export interface AddToCartParams {
  eventId: string;
  productId: string;
  productName: string;
  value: number;
  currency: string;
  sourceUrl: string;
  userData: UserData;
}

export interface CheckoutParams {
  eventId: string;
  productIds: string[];
  value: number;
  currency: string;
  numItems: number;
  sourceUrl: string;
  userData: UserData;
}

export interface PurchaseParams {
  eventId: string;
  productIds: string[];
  value: number;
  currency: string;
  numItems: number;
  sourceUrl: string;
  userData: UserData;
}

export interface TrackingPlatform {
  name: string;
  sendViewContent(params: ViewContentParams): Promise<void>;
  sendAddToCart(params: AddToCartParams): Promise<void>;
  sendInitiateCheckout(params: CheckoutParams): Promise<void>;
  sendPurchase(params: PurchaseParams): Promise<void>;
}
```

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/server/types.ts
git commit -m "feat: add TrackingPlatform interface and shared event types"
```

---

### Task 6: Server-Side Tracking Layer — Meta CAPI Adapter

**Files:**
- Create: `src/lib/tracking/server/meta-capi.ts`

**Step 1: Create the Meta Conversions API adapter**

```typescript
/**
 * Meta Conversions API (CAPI) Adapter
 * Sends server-side events to Meta for attribution.
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'crypto';
import type {
  TrackingPlatform,
  ViewContentParams,
  AddToCartParams,
  CheckoutParams,
  PurchaseParams,
} from './types';

const API_VERSION = 'v21.0';

interface MetaCApiEvent {
  event_name: string;
  event_id: string;
  event_time: number;
  event_source_url: string;
  action_source: 'website';
  user_data: Record<string, unknown>;
  custom_data: Record<string, unknown>;
}

function hashSha256(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

function buildUserData(params: { userData: ViewContentParams['userData'] }): Record<string, unknown> {
  const ud: Record<string, unknown> = {};
  if (params.userData.email) ud.em = [hashSha256(params.userData.email)];
  if (params.userData.ip) ud.client_ip_address = params.userData.ip;
  if (params.userData.userAgent) ud.client_user_agent = params.userData.userAgent;
  if (params.userData.fbc) ud.fbc = params.userData.fbc;
  if (params.userData.fbp) ud.fbp = params.userData.fbp;
  return ud;
}

export class MetaCapi implements TrackingPlatform {
  name = 'meta';
  private pixelId: string;
  private accessToken: string;

  constructor(pixelId: string, accessToken: string) {
    this.pixelId = pixelId;
    this.accessToken = accessToken;
  }

  private async sendEvent(event: MetaCApiEvent): Promise<void> {
    const url = `https://graph.facebook.com/${API_VERSION}/${this.pixelId}/events`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [event],
        access_token: this.accessToken,
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Meta CAPI ${response.status}: ${body}`);
    }
  }

  async sendViewContent(params: ViewContentParams): Promise<void> {
    await this.sendEvent({
      event_name: 'ViewContent',
      event_id: params.eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.sourceUrl,
      action_source: 'website',
      user_data: buildUserData(params),
      custom_data: {
        content_ids: [params.productId],
        content_name: params.productName,
        content_type: 'product',
        value: params.value / 100,
        currency: params.currency,
      },
    });
  }

  async sendAddToCart(params: AddToCartParams): Promise<void> {
    await this.sendEvent({
      event_name: 'AddToCart',
      event_id: params.eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.sourceUrl,
      action_source: 'website',
      user_data: buildUserData(params),
      custom_data: {
        content_ids: [params.productId],
        content_name: params.productName,
        content_type: 'product',
        value: params.value / 100,
        currency: params.currency,
      },
    });
  }

  async sendInitiateCheckout(params: CheckoutParams): Promise<void> {
    await this.sendEvent({
      event_name: 'InitiateCheckout',
      event_id: params.eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.sourceUrl,
      action_source: 'website',
      user_data: buildUserData(params),
      custom_data: {
        content_ids: params.productIds,
        content_type: 'product',
        value: params.value / 100,
        currency: params.currency,
        num_items: params.numItems,
      },
    });
  }

  async sendPurchase(params: PurchaseParams): Promise<void> {
    await this.sendEvent({
      event_name: 'Purchase',
      event_id: params.eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.sourceUrl,
      action_source: 'website',
      user_data: buildUserData(params),
      custom_data: {
        content_ids: params.productIds,
        content_type: 'product',
        value: params.value / 100,
        currency: params.currency,
        num_items: params.numItems,
      },
    });
  }
}
```

> **Note:** `value` is stored in grosze (minor units) in the database. Meta expects value in PLN (major units), so we divide by 100.

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/server/meta-capi.ts
git commit -m "feat: add Meta Conversions API adapter"
```

---

### Task 7: Server-Side Tracking Layer — ServerTracker Orchestrator

**Files:**
- Create: `src/lib/tracking/server/tracker.ts`

**Step 1: Create the orchestrator**

```typescript
/**
 * ServerTracker — Multi-platform event orchestrator
 * Registers platform adapters and fires events on all of them.
 * Failures are logged but never block the request.
 */

import type {
  TrackingPlatform,
  ViewContentParams,
  AddToCartParams,
  CheckoutParams,
  PurchaseParams,
} from './types';

export class ServerTracker {
  private platforms: TrackingPlatform[] = [];

  register(platform: TrackingPlatform): void {
    this.platforms.push(platform);
  }

  async trackViewContent(params: ViewContentParams): Promise<void> {
    await this.fireAll('sendViewContent', params);
  }

  async trackAddToCart(params: AddToCartParams): Promise<void> {
    await this.fireAll('sendAddToCart', params);
  }

  async trackInitiateCheckout(params: CheckoutParams): Promise<void> {
    await this.fireAll('sendInitiateCheckout', params);
  }

  async trackPurchase(params: PurchaseParams): Promise<void> {
    await this.fireAll('sendPurchase', params);
  }

  private async fireAll(
    method: keyof TrackingPlatform,
    params: unknown
  ): Promise<void> {
    for (const platform of this.platforms) {
      try {
        await (platform[method] as (p: unknown) => Promise<void>)(params);
      } catch (error) {
        console.error(`[tracking] ${platform.name}.${method} failed:`, error);
      }
    }
  }
}
```

**Step 2: Create the singleton instance**

Create: `src/lib/tracking/server/index.ts`

```typescript
/**
 * Server Tracking Singleton
 * Initializes ServerTracker with all registered platform adapters.
 */

import { env } from '$env/dynamic/private';
import { PUBLIC_META_PIXEL_ID } from '$env/static/public';
import { ServerTracker } from './tracker';
import { MetaCapi } from './meta-capi';

export const serverTracker = new ServerTracker();

// Register Meta CAPI if credentials are available
const metaAccessToken = env.META_CAPI_ACCESS_TOKEN;
if (PUBLIC_META_PIXEL_ID && metaAccessToken) {
  serverTracker.register(new MetaCapi(PUBLIC_META_PIXEL_ID, metaAccessToken));
}

// Future: Register Google Ads, TikTok, etc.
// if (env.GOOGLE_ADS_CONVERSION_ID && env.GOOGLE_ADS_TOKEN) {
//   serverTracker.register(new GoogleAdsApi(...));
// }

export type { ServerTracker } from './tracker';
```

**Step 3: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 4: Commit**

```bash
git add src/lib/tracking/server/
git commit -m "feat: add ServerTracker orchestrator with Meta CAPI singleton"
```

---

### Task 8: Remote Functions for Server-Side Event Tracking

> **Skill:** Invoke `@svelte-skills:sveltekit-remote-functions` before starting — covers `command()`, `getRequestEvent()`, Valibot validation, and cookie limitations.

**Files:**
- Create: `src/lib/tracking/tracking.remote.ts`

**Step 1: Create the remote functions module**

> **Important:** This file uses SvelteKit remote functions (`command()` from `$app/server`). These execute on the server when called from the browser. `getRequestEvent()` provides access to cookies/headers.

```typescript
/**
 * Server-Side Tracking Remote Functions
 * Called from client components via command() — execute on server.
 * Read fc_session cookie, look up tracking session, fire CAPI events.
 */

import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { getTrackingSession } from './capture-params';
import { serverTracker } from './server';
import { db } from '$lib/server/db';
import { consentRecords } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

const SESSION_COOKIE = 'fc_session';

async function getLatestConsent(sessionId: string) {
  const [consent] = await db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.sessionId, sessionId))
    .orderBy(desc(consentRecords.createdAt))
    .limit(1);
  return consent ?? null;
}

export const track_view_content = command(
  v.object({
    productId: v.string(),
    productName: v.string(),
    price: v.number(),
    eventId: v.string(),
    sourceUrl: v.string(),
  }),
  async ({ productId, productName, price, eventId, sourceUrl }) => {
    try {
      const event = getRequestEvent();
      const sessionId = event.cookies.get(SESSION_COOKIE);
      const session = await getTrackingSession(sessionId);
      const consent = sessionId ? await getLatestConsent(sessionId) : null;

      if (session && consent?.marketing) {
        await serverTracker.trackViewContent({
          eventId,
          productId,
          productName,
          value: price,
          currency: 'PLN',
          sourceUrl,
          userData: {
            ip: session.ipAddress,
            userAgent: session.userAgent,
            fbc: session.fbc,
            fbp: session.fbp,
            fbclid: session.fbclid,
          },
        });
      }
    } catch (error) {
      console.error('[tracking] track_view_content failed:', error);
    }
    return { tracked: true };
  }
);

export const track_add_to_cart = command(
  v.object({
    productId: v.string(),
    productName: v.string(),
    price: v.number(),
    eventId: v.string(),
    sourceUrl: v.string(),
  }),
  async ({ productId, productName, price, eventId, sourceUrl }) => {
    try {
      const event = getRequestEvent();
      const sessionId = event.cookies.get(SESSION_COOKIE);
      const session = await getTrackingSession(sessionId);
      const consent = sessionId ? await getLatestConsent(sessionId) : null;

      if (session && consent?.marketing) {
        await serverTracker.trackAddToCart({
          eventId,
          productId,
          productName,
          value: price,
          currency: 'PLN',
          sourceUrl,
          userData: {
            ip: session.ipAddress,
            userAgent: session.userAgent,
            fbc: session.fbc,
            fbp: session.fbp,
            fbclid: session.fbclid,
          },
        });
      }
    } catch (error) {
      console.error('[tracking] track_add_to_cart failed:', error);
    }
    return { tracked: true };
  }
);

export const track_checkout = command(
  v.object({
    productIds: v.array(v.string()),
    totalValue: v.number(),
    numItems: v.number(),
    eventId: v.string(),
    sourceUrl: v.string(),
  }),
  async ({ productIds, totalValue, numItems, eventId, sourceUrl }) => {
    try {
      const event = getRequestEvent();
      const sessionId = event.cookies.get(SESSION_COOKIE);
      const session = await getTrackingSession(sessionId);
      const consent = sessionId ? await getLatestConsent(sessionId) : null;

      if (session && consent?.marketing) {
        await serverTracker.trackInitiateCheckout({
          eventId,
          productIds,
          value: totalValue,
          currency: 'PLN',
          numItems,
          sourceUrl,
          userData: {
            ip: session.ipAddress,
            userAgent: session.userAgent,
            fbc: session.fbc,
            fbp: session.fbp,
            fbclid: session.fbclid,
          },
        });
      }
    } catch (error) {
      console.error('[tracking] track_checkout failed:', error);
    }
    return { tracked: true };
  }
);

export const save_consent = command(
  v.object({
    necessary: v.boolean(),
    analytics: v.boolean(),
    marketing: v.boolean(),
  }),
  async ({ necessary, analytics, marketing }) => {
    try {
      const event = getRequestEvent();
      const sessionId = event.cookies.get(SESSION_COOKIE);
      if (!sessionId) return { saved: false };

      await db.insert(consentRecords).values({
        sessionId,
        necessary,
        analytics,
        marketing,
      });

      return { saved: true };
    } catch (error) {
      console.error('[tracking] save_consent failed:', error);
      return { saved: false };
    }
  }
);
```

**Step 2: Install valibot (if not already installed)**

Run: `bun add valibot`

**Step 3: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 4: Commit**

```bash
git add src/lib/tracking/tracking.remote.ts package.json bun.lockb
git commit -m "feat: add server-side tracking remote functions"
```

---

### Task 9: Consent State Store (Svelte 5 Runes)

> **Skill:** Invoke `@svelte-skills:svelte-runes` before starting — covers `$state()`, `$derived()`, reactive store patterns, and common mistakes to avoid.

**Files:**
- Create: `src/lib/tracking/consent.svelte.ts`

**Step 1: Create the consent rune store**

```typescript
/**
 * Consent State — Svelte 5 Runes Store
 * Manages GDPR cookie consent with reactive state.
 * Reads from cookie on init, updates cookie + POSTs to server on change.
 */

import { browser } from '$app/environment';

export type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_NAME = 'fc_consent';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function readFromCookie(): ConsentState | null {
  if (!browser) return null;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function writeToCookie(state: ConsentState): void {
  if (!browser) return;
  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${COOKIE_NAME}=${value};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
}

async function persistToServer(state: ConsentState): Promise<void> {
  try {
    const { save_consent } = await import('./tracking.remote');
    await save_consent(state);
  } catch (error) {
    console.error('[consent] failed to persist to server:', error);
  }
}

function createConsentStore() {
  let state = $state<ConsentState | null>(readFromCookie());

  const hasConsented = $derived(state !== null);
  const marketing = $derived(state?.marketing ?? false);
  const analytics = $derived(state?.analytics ?? false);

  function apply(newState: ConsentState): void {
    state = newState;
    writeToCookie(newState);
    persistToServer(newState);
  }

  return {
    get state() { return state; },
    get hasConsented() { return hasConsented; },
    get marketing() { return marketing; },
    get analytics() { return analytics; },

    grantAll(): void {
      apply({ necessary: true, analytics: true, marketing: true });
    },

    rejectAll(): void {
      apply({ necessary: true, analytics: false, marketing: false });
    },

    update(partial: Partial<Omit<ConsentState, 'necessary'>>): void {
      apply({
        necessary: true,
        analytics: partial.analytics ?? state?.analytics ?? false,
        marketing: partial.marketing ?? state?.marketing ?? false,
      });
    },
  };
}

export const consent = createConsentStore();
```

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/consent.svelte.ts
git commit -m "feat: add GDPR consent state store with Svelte 5 runes"
```

---

### Task 10: Consent Banner Component

> **Skill:** Invoke `@component` before starting — guides Svelte component creation following the Fold Club brutalist design system.
> **Skill:** Invoke `@svelte-skills:svelte-runes` — component uses `$state()` for toggle state and `$props()` if needed.
> **Tool:** Run `svelte-autofixer` MCP tool on the component before committing.

**Files:**
- Create: `src/lib/components/tracking/ConsentBanner.svelte`

**Step 1: Create the consent banner**

Style with brutalist design system classes. Check `src/app.css` and `docs/DESIGN_SYSTEM.md` for available utilities. Use `brutal-card`, `paper-shadow-lg`, `border-3 border-ink`, `btn btn-primary`, `btn btn-secondary`, `paper-press`, `heading-2`, `body`, `label`. No rounded corners. No transitions.

The banner:
- Shows at bottom of screen if user hasn't consented yet
- Has "Accept All", "Reject All", "Customize" buttons
- Customize expands toggles for Analytics and Marketing (Necessary always on)
- "Save Preferences" saves granular choice
- Uses i18n messages from paraglide (create message keys)

> **Note:** Add the necessary i18n message keys to `messages/en.json` and `messages/pl.json`. Message keys should follow the existing pattern (snake_case, prefixed with section name).

Required i18n keys:
- `consent_banner_text` — "We use cookies to improve your experience and measure advertising effectiveness."
- `consent_accept_all` — "Accept All"
- `consent_reject_all` — "Reject All"
- `consent_customize` — "Customize"
- `consent_preferences_title` — "Cookie Preferences"
- `consent_necessary_label` — "Necessary"
- `consent_necessary_desc` — "Shopping cart, authentication, security"
- `consent_necessary_always` — "Always active"
- `consent_analytics_label` — "Analytics"
- `consent_analytics_desc` — "Google Analytics — helps us understand how you use the site"
- `consent_marketing_label` — "Marketing"
- `consent_marketing_desc` — "Facebook Pixel — helps us show you relevant ads"
- `consent_save` — "Save Preferences"

Run the autofixer on the component before committing: use the `svelte-autofixer` MCP tool.

**Step 2: Add ConsentBanner to `+layout.svelte`**

Import and render `ConsentBanner` at the bottom of the layout (before closing `</div>`), after `<FooterSection />`.

**Step 3: Verify types and autofixer**

Run: `bun run check`

Expected: No errors.

**Step 4: Commit**

```bash
git add src/lib/components/tracking/ConsentBanner.svelte src/routes/+layout.svelte messages/en.json messages/pl.json
git commit -m "feat: add GDPR consent banner with granular cookie controls"
```

---

### Task 11: Consent-Gate Tracking Initialization in Layout

> **Skill:** Invoke `@svelte-skills:svelte-runes` — uses `$effect()` for reactive consent-gated initialization (replaces `onMount`).

**Files:**
- Modify: `src/routes/+layout.svelte`

**Step 1: Replace unconditional tracking init with consent-gated init**

Current code in `+layout.svelte` (lines 39-50):
```typescript
onMount(() => {
  initMetaPixel();
  initGA4();
});

$effect(() => {
  if (browser && page.url) {
    trackMetaPageView();
    trackGA4PageView(page.url.pathname, document.title);
  }
});
```

Replace with:
```typescript
import { consent } from '$lib/tracking/consent.svelte';

// Initialize tracking based on consent
$effect(() => {
  if (browser) {
    if (consent.marketing) {
      initMetaPixel();
    }
    if (consent.analytics) {
      initGA4();
    }
  }
});

// Track page views on client-side navigation (only if consented)
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

Remove the `onMount` block — `$effect` handles initialization reactively when consent changes.

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/routes/+layout.svelte
git commit -m "feat: gate tracking initialization on GDPR consent state"
```

---

### Task 12: Add Event Deduplication to Client-Side Meta Pixel

**Files:**
- Modify: `src/lib/tracking/meta-pixel.ts`

**Step 1: Update all tracking functions to accept and pass `eventID`**

The Meta Pixel `fbq()` call accepts an optional 4th argument `{ eventID: string }` for deduplication. Update each tracking function to accept an optional `eventId` parameter.

Update `trackMetaAddToCart`:
```typescript
export function trackMetaAddToCart(
  productId: string,
  productName: string,
  value: number,
  eventId?: string
): void {
  if (!browser || !window.fbq) return;

  window.fbq('track', 'AddToCart', {
    content_ids: [productId.toString()],
    content_name: productName,
    content_type: 'product',
    value: value / 100,
    currency: 'PLN'
  }, eventId ? { eventID: eventId } : undefined);
}
```

Apply the same pattern to:
- `trackMetaInitiateCheckout` — add `eventId?: string` param, pass `{ eventID: eventId }` as 4th arg
- `trackMetaViewContent` — add `eventId?: string` param, pass `{ eventID: eventId }` as 4th arg
- `trackMetaPageView` — no change needed (PageView doesn't need dedup)

> **Note:** Also fix `value` to divide by 100 in all functions — currently sending grosze to Meta (e.g., 9900 instead of 99.00). Meta expects the value in major currency units.

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/meta-pixel.ts
git commit -m "feat: add event deduplication to Meta Pixel client-side calls"
```

---

### Task 13: Update Unified Tracking Module with Dedup + Server-Side

**Files:**
- Modify: `src/lib/tracking/index.ts`

**Step 1: Update unified functions to generate event IDs and fire both client + server**

The unified functions (`trackAddToCart`, `trackProductView`, `trackCheckoutClick`) should now:
1. Generate a deterministic `event_id`
2. Fire client-side Pixel with `eventID`
3. Fire server-side CAPI via remote function

```typescript
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
```

> **Note:** The `trackGA4FakeDoor` calls have been removed — they were for the fake-door flow. Remove unused exports from ga4.ts if nothing else references them.

**Step 2: Verify types**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/index.ts
git commit -m "feat: unify client + server tracking with event deduplication"
```

---

### Task 14: Add "Cookie Settings" Link to Footer

**Files:**
- Modify: `src/lib/components/landing/FooterSection.svelte`

**Step 1: Add a "Cookie Settings" button**

Add a button/link in the footer that reopens the consent banner. This requires the consent store to expose a method to reset consent (or a way to signal the banner to reopen).

Simplest approach: add a `showBanner` export to `consent.svelte.ts`:

In `consent.svelte.ts`, add to the store:
```typescript
let bannerVisible = $state(false);

return {
  // ... existing getters/methods
  get bannerVisible() { return bannerVisible || !hasConsented; },
  showBanner() { bannerVisible = true; },
  hideBanner() { bannerVisible = false; },
};
```

Update `ConsentBanner.svelte` to use `consent.bannerVisible` instead of `!consent.hasConsented`.

In `FooterSection.svelte`, add after the social links or in the legal section:
```svelte
<button onclick={() => consent.showBanner()} class="body text-cream/50 hover:text-cream">
  {m.footer_cookie_settings()}
</button>
```

Add i18n keys:
- `footer_cookie_settings` — EN: "Cookie Settings", PL: "Ustawienia ciasteczek"

**Step 2: Verify types and run autofixer**

Run: `bun run check`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/lib/tracking/consent.svelte.ts src/lib/components/tracking/ConsentBanner.svelte src/lib/components/landing/FooterSection.svelte messages/en.json messages/pl.json
git commit -m "feat: add Cookie Settings link in footer to reopen consent banner"
```

---

### Task 15: Update .env.example and Add Environment Variable

**Files:**
- Modify: `.env.example`

**Step 1: Add the new env var**

Add after the existing GA4 block:

```
# Meta Conversions API (server-side tracking)
# Get from: https://business.facebook.com/events_manager → Settings → Conversions API
META_CAPI_ACCESS_TOKEN="your-capi-access-token"
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: add META_CAPI_ACCESS_TOKEN to .env.example"
```

---

### Task 16: Manual Verification & Testing

**Background:** No code changes. This is a manual testing checklist.

**Step 1: Start the dev server**

Run: `bun run dev`

**Step 2: Open browser and verify consent banner**

1. Open http://localhost:5173 in incognito mode
2. Consent banner should appear at bottom of page
3. Click "Customize" — should expand with toggles
4. Toggle Marketing ON, click "Save Preferences"
5. Verify: Meta Pixel loads in Network tab (fbevents.js)
6. Verify: `fc_consent` cookie is set
7. Verify: `fc_session` cookie is set

**Step 3: Verify parameter capture**

1. Visit: http://localhost:5173?fbclid=test123&utm_source=facebook&utm_medium=cpc&utm_campaign=test
2. Check Drizzle Studio (`bun run db:studio`) → `tracking_sessions` table
3. Verify: Row exists with `fbclid=test123`, `utm_source=facebook`, etc.

**Step 4: Verify consent persistence**

1. Check `consent_records` table in Drizzle Studio
2. Verify: Row exists with `marketing=true` matching your session

**Step 5: Verify server-side tracking**

1. Navigate to a product page
2. Check server console for any `[tracking]` error logs
3. If `META_CAPI_ACCESS_TOKEN` is set, check Meta Events Manager → Test Events
4. Verify: `ViewContent` event appears with correct product ID

**Step 6: Verify event deduplication**

1. With both Pixel and CAPI active, add a product to cart
2. Check Meta Events Manager → Overview
3. Verify: Only 1 `AddToCart` event (not 2)

**Step 7: Verify footer cookie settings**

1. Click "Cookie Settings" in footer
2. Banner should reopen
3. Change preferences → Save
4. Verify: New `consent_records` row created

**Step 8: Verify reject all**

1. Clear cookies, reload in incognito
2. Click "Reject All"
3. Verify: Meta Pixel does NOT load (no fbevents.js in Network tab)
4. Verify: GA4 does NOT load (no gtag.js in Network tab)

---

## Summary of All Files

| File | Action | Task |
|------|--------|------|
| `src/lib/server/db/schema.ts` | Modified — add 2 tables + order columns | 1 |
| `src/lib/tracking/dedup.ts` | Created — event ID generation | 2 |
| `src/lib/tracking/capture-params.ts` | Created — URL param extraction | 3 |
| `src/hooks.server.ts` | Modified — add tracking capture hook | 4 |
| `src/lib/tracking/server/types.ts` | Created — TrackingPlatform interface | 5 |
| `src/lib/tracking/server/meta-capi.ts` | Created — Meta CAPI adapter | 6 |
| `src/lib/tracking/server/tracker.ts` | Created — ServerTracker orchestrator | 7 |
| `src/lib/tracking/server/index.ts` | Created — singleton instance | 7 |
| `src/lib/tracking/tracking.remote.ts` | Created — remote functions | 8 |
| `src/lib/tracking/consent.svelte.ts` | Created — consent rune store | 9 |
| `src/lib/components/tracking/ConsentBanner.svelte` | Created — consent banner UI | 10 |
| `src/routes/+layout.svelte` | Modified — consent-gated init + banner | 10, 11 |
| `src/lib/tracking/meta-pixel.ts` | Modified — add eventID dedup | 12 |
| `src/lib/tracking/index.ts` | Modified — unified client + server | 13 |
| `src/lib/components/landing/FooterSection.svelte` | Modified — cookie settings link | 14 |
| `.env.example` | Modified — add CAPI token | 15 |
| `messages/en.json` | Modified — consent i18n keys | 10, 14 |
| `messages/pl.json` | Modified — consent i18n keys | 10, 14 |
