# Consent-Gated Tracking Sessions

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Only create tracking sessions in the database after a user interacts with the consent modal — eliminating bot pollution and ensuring GDPR compliance.

**Architecture:** Remove server-side session creation from hooks. Buffer URL attribution params (fbclid, UTMs) in sessionStorage on the client. On consent interaction, POST to a `/api/tracking/session` endpoint that creates the DB session + sets the `fc_session` httpOnly cookie + records consent — all in one atomic call. We use a `+server.ts` API route (not `command()`) because `command()` cannot propagate Set-Cookie headers to the browser (known SvelteKit limitation). Consent banner becomes a blocking full-page modal.

**Tech Stack:** SvelteKit API routes (`+server.ts`), Svelte 5 runes, sessionStorage, Drizzle ORM

**Svelte skills context:**
- `@svelte-skills:svelte-runes` — `$state()`, `$derived()`, `$effect()` usage. `$effect` is an escape hatch; prefer event handlers and `$derived`. `onMount` for fire-once side effects.
- `@svelte-skills:sveltekit-remote-functions` — `command()` CANNOT set cookies (`event.cookies.set()` does not propagate Set-Cookie headers). Use `+server.ts` API routes for operations that need to set httpOnly cookies.
- `@svelte-skills:sveltekit-structure` — SSR/hydration: guard browser APIs with `import { browser } from '$app/environment'` or `onMount`.
- `@svelte-skills:svelte-components` — Use `svelte-autofixer` MCP tool on all Svelte components before finalizing.

---

### Task 1: Create client-side param buffer module

**Files:**
- Create: `src/lib/tracking/param-buffer.ts`

**Step 1: Create param-buffer.ts**

This module extracts attribution params from the current URL on page load and stores them in sessionStorage. It exposes `bufferParams()`, `getBufferedParams()`, and `clearBufferedParams()`.

```ts
/**
 * Client-side URL Parameter Buffer
 * Extracts fbclid, UTM params from the URL and stores in sessionStorage.
 * Params are held until consent is given, then sent to the server.
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'fc_buffered_params';

export interface BufferedParams {
  fbclid: string | null;
  gclid: string | null;
  ttclid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  landingPage: string | null;
}

/**
 * Extract params from the current URL and save to sessionStorage.
 * Called on every page load in +layout.svelte.
 * Only overwrites stored params if the new URL has attribution params
 * (preserves the original landing params across navigation).
 */
export function bufferParams(): void {
  if (!browser) return;

  const url = new URL(window.location.href);
  const params: BufferedParams = {
    fbclid: url.searchParams.get('fbclid'),
    gclid: url.searchParams.get('gclid'),
    ttclid: url.searchParams.get('ttclid'),
    utmSource: url.searchParams.get('utm_source'),
    utmMedium: url.searchParams.get('utm_medium'),
    utmCampaign: url.searchParams.get('utm_campaign'),
    utmContent: url.searchParams.get('utm_content'),
    utmTerm: url.searchParams.get('utm_term'),
    landingPage: url.pathname,
  };

  const hasAny = Object.values(params).some((v) => v !== null);

  // Only write if we have new params, OR if nothing is buffered yet (capture landing page)
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (hasAny || !existing) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }
}

/**
 * Retrieve buffered params. Returns null if nothing stored.
 */
export function getBufferedParams(): BufferedParams | null {
  if (!browser) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear buffered params after they've been sent to the server.
 */
export function clearBufferedParams(): void {
  if (!browser) return;
  sessionStorage.removeItem(STORAGE_KEY);
}
```

**Step 2: Verify no type errors**

Run: `bun run check`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/lib/tracking/param-buffer.ts
git commit -m "feat: add client-side param buffer for consent-gated sessions"
```

---

### Task 2: Create session API route and remove `save_consent` from tracking.remote.ts

**Why a `+server.ts` route?** Per `@svelte-skills:sveltekit-remote-functions`, `command()` functions CANNOT propagate `Set-Cookie` headers to the browser. Since `create_session` must set the `fc_session` httpOnly cookie, we use a `+server.ts` API endpoint instead.

**Files:**
- Create: `src/routes/api/tracking/session/+server.ts`
- Modify: `src/lib/tracking/tracking.remote.ts` (remove `save_consent`)

**Step 1: Create the API route**

```ts
// src/routes/api/tracking/session/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { trackingSessions, consentRecords } from '$lib/server/db/schema';
import { v7 as uuidv7 } from 'uuid';

const SESSION_COOKIE = 'fc_session';
const SESSION_EXPIRY_DAYS = 30;

export const POST: RequestHandler = async ({ request, cookies, url }) => {
  try {
    const body = await request.json();
    const { consent, params } = body;

    // Check if session already exists (user re-consenting)
    const existingSessionId = cookies.get(SESSION_COOKIE);
    if (existingSessionId) {
      await db.insert(consentRecords).values({
        sessionId: existingSessionId,
        necessary: consent.necessary,
        analytics: consent.analytics,
        marketing: consent.marketing,
      });
      return json({ sessionId: existingSessionId });
    }

    // Create new session
    const sessionId = uuidv7();
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null;
    const userAgent = request.headers.get('user-agent');
    const fbc = cookies.get('_fbc') ?? null;
    const fbp = cookies.get('_fbp') ?? null;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await db.insert(trackingSessions).values({
      sessionId,
      fbclid: params.fbclid ?? null,
      fbc,
      fbp,
      gclid: params.gclid ?? null,
      ttclid: params.ttclid ?? null,
      utmSource: params.utmSource ?? null,
      utmMedium: params.utmMedium ?? null,
      utmCampaign: params.utmCampaign ?? null,
      utmContent: params.utmContent ?? null,
      utmTerm: params.utmTerm ?? null,
      ipAddress,
      userAgent,
      landingPage: params.landingPage ?? null,
      expiresAt,
    });

    // Record consent
    await db.insert(consentRecords).values({
      sessionId,
      necessary: consent.necessary,
      analytics: consent.analytics,
      marketing: consent.marketing,
    });

    // Set httpOnly cookie — this works in +server.ts (unlike command())
    cookies.set(SESSION_COOKIE, sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return json({ sessionId });
  } catch (error) {
    console.error('[tracking] create_session failed:', error);
    return json({ sessionId: null }, { status: 500 });
  }
};
```

**Step 2: Remove `save_consent` from tracking.remote.ts**

Delete the entire `save_consent` export (lines 144-169 in `src/lib/tracking/tracking.remote.ts`).

Also remove the now-unused imports that were only used by `save_consent`:
- Remove `consentRecords` from the schema import (keep `trackingSessions` import via `getTrackingSession`)
- Remove `desc` from drizzle-orm import if no longer used

After removal, verify that the remaining imports in tracking.remote.ts are:
```ts
import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { getTrackingSession } from './capture-params';
import { serverTracker } from './server';
import { db } from '$lib/server/db';
import { consentRecords } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
```

Note: `consentRecords`, `eq`, `desc`, and `db` are still used by `getLatestConsent()`. Keep them.

**Step 3: Verify no type errors**

Run: `bun run check`
Expected: 0 errors (the old `save_consent` import in `consent.svelte.ts` will break — that's expected, fixed in Task 3)

**Step 4: Commit**

```bash
git add src/routes/api/tracking/session/+server.ts src/lib/tracking/tracking.remote.ts
git commit -m "feat: add session API route for cookie setting, remove save_consent"
```

---

### Task 3: Update consent store to call session API with buffered params

**Files:**
- Modify: `src/lib/tracking/consent.svelte.ts`

**Step 1: Replace `persistToServer` with session creation logic**

Replace the `persistToServer` function (lines 42-49) with a `fetch` call to the new API route. We use `fetch` (not `command()`) because the API route needs to set the `fc_session` httpOnly cookie via `Set-Cookie` header.

```ts
async function createSessionOnServer(state: ConsentState): Promise<void> {
  try {
    const { getBufferedParams, clearBufferedParams } = await import('./param-buffer');

    const params = getBufferedParams();

    await fetch('/api/tracking/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: state,
        params: params ?? {
          fbclid: null,
          gclid: null,
          ttclid: null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          utmContent: null,
          utmTerm: null,
          landingPage: null,
        },
      }),
    });

    clearBufferedParams();
  } catch (error) {
    console.error('[consent] failed to create session:', error);
  }
}
```

In the `apply` function (line 59-64), replace the `persistToServer(newState)` call with `createSessionOnServer(newState)`:

```ts
function apply(newState: ConsentState): void {
  state = newState;
  writeToCookie(newState);
  createSessionOnServer(newState);
  bannerVisible = false;
}
```

**Step 2: Verify no type errors**

Run: `bun run check`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/lib/tracking/consent.svelte.ts
git commit -m "feat: consent store calls session API with buffered params"
```

---

### Task 4: Remove tracking hook from hooks.server.ts

**Files:**
- Modify: `src/hooks.server.ts`

**Step 1: Remove handleTracking and simplify**

Replace the entire file with:

```ts
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
    });
  });
```

Removed:
- `sequence` import (no longer needed with single handler)
- `captureTrackingParams` import
- Entire `handleTracking` function
- `sequence(handleTracking, handleParaglide)` — replaced with direct export

**Step 2: Verify no type errors**

Run: `bun run check`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/hooks.server.ts
git commit -m "refactor: remove server-side tracking hook, sessions now consent-gated"
```

---

### Task 5: Clean up capture-params.ts — remove dead code

**Files:**
- Modify: `src/lib/tracking/capture-params.ts`

**Step 1: Remove everything except `getTrackingSession`**

The entire file becomes:

```ts
/**
 * Tracking Session Lookup
 * Looks up tracking sessions by session ID for server-side event firing.
 */

import { db } from '$lib/server/db';
import { trackingSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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

Removed:
- `v7 as uuidv7` import (moved to `tracking.remote.ts`)
- `RequestEvent` type import
- `SESSION_COOKIE` and `SESSION_EXPIRY_DAYS` constants (moved to `tracking.remote.ts`)
- `CapturedParams` interface (moved to `param-buffer.ts` client-side)
- `extractParams()` function
- `hasAnyParam()` function
- `getClientIp()` function (IP now captured in `create_session`)
- `captureTrackingParams()` function (entire server-side capture flow removed)

**Step 2: Verify no type errors**

Run: `bun run check`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/lib/tracking/capture-params.ts
git commit -m "refactor: strip capture-params.ts to session lookup only"
```

---

### Task 6: Add param buffering to +layout.svelte

**Files:**
- Modify: `src/routes/+layout.svelte`

**Step 1: Import and call bufferParams on mount**

Add import at the top of the `<script>` block (after existing imports):

```ts
import { bufferParams } from '$lib/tracking/param-buffer';
import { onMount } from 'svelte';
```

Add this after the existing `$effect` blocks (after line 71):

```ts
// Buffer URL attribution params to sessionStorage on first load
onMount(() => {
  bufferParams();
});
```

We use `onMount` (not `$effect`) because this is a fire-once side effect on page load — we don't want it to re-run on every navigation. `bufferParams()` internally handles the "only overwrite if new params present" logic.

**Step 2: Verify no type errors**

Run: `bun run check`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/routes/+layout.svelte
git commit -m "feat: buffer URL attribution params on page load"
```

---

### Task 7: Rewrite ConsentBanner as blocking modal

**Files:**
- Modify: `src/lib/components/tracking/ConsentBanner.svelte`

**Step 1: Rewrite the component**

Replace the entire file. The new component is a centered modal with a dark backdrop overlay that blocks interaction. Same consent logic, new layout.

Use the `component` skill (@component) to ensure brutalist design system compliance.

```svelte
<script lang="ts">
  import { consent } from '$lib/tracking/consent.svelte';
  import { m } from '$lib/paraglide/messages';

  let showCustomize = $state(false);
  let localAnalytics = $state(false);
  let localMarketing = $state(false);

  function handleAcceptAll() {
    consent.grantAll();
  }

  function handleRejectAll() {
    consent.rejectAll();
  }

  function handleCustomize() {
    if (!showCustomize) {
      localAnalytics = consent.analytics;
      localMarketing = consent.marketing;
    }
    showCustomize = !showCustomize;
  }

  function handleSave() {
    consent.update({
      analytics: localAnalytics,
      marketing: localMarketing,
    });
  }
</script>

{#if consent.bannerVisible}
  <!-- Full-page backdrop overlay — blocks all interaction -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
    <!-- Modal card -->
    <div class="brutal-card paper-shadow-lg w-full max-w-lg border-3 border-ink bg-cream p-6 md:p-8">
      {#if !showCustomize}
        <div class="space-y-6">
          <h2 class="heading-2 text-ink">{m.consent_preferences_title()}</h2>
          <p class="body text-ink">
            {m.consent_banner_text()}
          </p>
          <div class="flex flex-wrap gap-3">
            <button onclick={handleAcceptAll} class="btn btn-primary paper-press">
              {m.consent_accept_all()}
            </button>
            <button onclick={handleRejectAll} class="btn btn-secondary paper-press">
              {m.consent_reject_all()}
            </button>
            <button onclick={handleCustomize} class="btn btn-secondary paper-press">
              {m.consent_customize()}
            </button>
          </div>
        </div>
      {:else}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="heading-2 text-ink">{m.consent_preferences_title()}</h2>
            <button onclick={handleCustomize} class="body text-ink-soft hover:text-ink">
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <!-- Necessary cookies (always on) -->
            <div class="brutal-card bg-cream-warm p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label mb-1 text-ink">{m.consent_necessary_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_necessary_desc()}</p>
                </div>
                <div class="label text-ink-muted">{m.consent_necessary_always()}</div>
              </div>
            </div>

            <!-- Analytics cookies -->
            <div class="brutal-card bg-paper p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label mb-1 text-ink">{m.consent_analytics_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_analytics_desc()}</p>
                </div>
                <label class="relative inline-block h-6 w-12">
                  <input type="checkbox" bind:checked={localAnalytics} class="peer sr-only" />
                  <div class="h-full w-full border-3 border-ink bg-cream peer-checked:bg-mint"></div>
                  <div class="absolute top-0 left-0 h-6 w-6 bg-ink peer-checked:left-6"></div>
                </label>
              </div>
            </div>

            <!-- Marketing cookies -->
            <div class="brutal-card bg-paper p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="label mb-1 text-ink">{m.consent_marketing_label()}</h3>
                  <p class="body-small text-ink-soft">{m.consent_marketing_desc()}</p>
                </div>
                <label class="relative inline-block h-6 w-12">
                  <input type="checkbox" bind:checked={localMarketing} class="peer sr-only" />
                  <div class="h-full w-full border-3 border-ink bg-cream peer-checked:bg-mint"></div>
                  <div class="absolute top-0 left-0 h-6 w-6 bg-ink peer-checked:left-6"></div>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button onclick={handleSave} class="btn btn-primary paper-press">
              {m.consent_save()}
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
```

**Step 2: Run svelte-autofixer**

Use the `svelte-autofixer` MCP tool on the component. Fix any issues until clean.

**Step 3: Verify no type errors**

Run: `bun run check`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/lib/components/tracking/ConsentBanner.svelte
git commit -m "feat: consent banner → blocking modal with backdrop overlay"
```

---

### Task 8: Full build verification and cleanup check

**Step 1: Type check**

Run: `bun run check`
Expected: 0 errors, 0 warnings

**Step 2: Production build**

Run: `bun run build`
Expected: Clean build, no errors

**Step 3: Verify no dead imports**

Search for any remaining references to removed code:

```bash
grep -r "captureTrackingParams" src/
grep -r "save_consent" src/
grep -r "getClientIp" src/
grep -r "extractParams" src/
grep -r "hasAnyParam" src/
grep -r "persistToServer" src/
```

All should return 0 results.

**Step 4: Verify the tracking.remote.ts still imports getTrackingSession from capture-params**

```bash
grep "getTrackingSession" src/lib/tracking/tracking.remote.ts
```

Expected: `import { getTrackingSession } from './capture-params';`

**Step 5: Verify session API route exists and is wired**

```bash
ls src/routes/api/tracking/session/+server.ts
```

Expected: File exists.

**Step 6: Commit (if any cleanup needed)**

```bash
git commit -m "chore: final cleanup for consent-gated sessions"
```
