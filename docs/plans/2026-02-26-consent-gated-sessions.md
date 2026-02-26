# Consent-Gated Tracking Sessions

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Only create tracking sessions in the database after a user interacts with the consent modal — eliminating bot pollution and ensuring GDPR compliance.

**Architecture:** Remove server-side session creation from hooks. Buffer URL attribution params (fbclid, UTMs) in sessionStorage on the client. On consent interaction, call a single `create_session` remote function that creates the DB session + sets the `fc_session` cookie + records consent — all in one atomic call. Consent banner becomes a blocking full-page modal.

**Tech Stack:** SvelteKit remote functions (`command()`), Svelte 5 runes, sessionStorage, Valibot, Drizzle ORM

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

### Task 2: Add `create_session` remote function and remove `save_consent`

**Files:**
- Modify: `src/lib/tracking/tracking.remote.ts`

**Step 1: Replace `save_consent` with `create_session`**

The new `create_session` remote function does everything in one call:
1. Creates the tracking session in DB
2. Sets the `fc_session` httpOnly cookie
3. Records the consent choice

Remove the `save_consent` export entirely.

Add these imports at the top (alongside existing ones):
```ts
import { trackingSessions, consentRecords } from '$lib/server/db/schema';
import { v7 as uuidv7 } from 'uuid';
```

Remove the existing import of just `consentRecords` since we now import both.

Remove `save_consent` (lines 144-169) and replace with:

```ts
const SESSION_COOKIE = 'fc_session';
const SESSION_EXPIRY_DAYS = 30;

export const create_session = command(
  v.object({
    consent: v.object({
      necessary: v.boolean(),
      analytics: v.boolean(),
      marketing: v.boolean(),
    }),
    params: v.object({
      fbclid: v.nullable(v.string()),
      gclid: v.nullable(v.string()),
      ttclid: v.nullable(v.string()),
      utmSource: v.nullable(v.string()),
      utmMedium: v.nullable(v.string()),
      utmCampaign: v.nullable(v.string()),
      utmContent: v.nullable(v.string()),
      utmTerm: v.nullable(v.string()),
      landingPage: v.nullable(v.string()),
    }),
  }),
  async ({ consent, params }) => {
    try {
      const event = getRequestEvent();

      // Check if session already exists (user re-consenting)
      const existingSessionId = event.cookies.get(SESSION_COOKIE);
      if (existingSessionId) {
        // Just update consent record
        await db.insert(consentRecords).values({
          sessionId: existingSessionId,
          necessary: consent.necessary,
          analytics: consent.analytics,
          marketing: consent.marketing,
        });
        return { sessionId: existingSessionId };
      }

      // Create new session
      const sessionId = uuidv7();
      const ipAddress =
        event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        event.request.headers.get('x-real-ip') ??
        null;
      const userAgent = event.request.headers.get('user-agent');
      const fbc = event.cookies.get('_fbc') ?? null;
      const fbp = event.cookies.get('_fbp') ?? null;

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
        landingPage: params.landingPage,
        expiresAt,
      });

      // Record consent
      await db.insert(consentRecords).values({
        sessionId,
        necessary: consent.necessary,
        analytics: consent.analytics,
        marketing: consent.marketing,
      });

      // Set httpOnly cookie
      event.cookies.set(SESSION_COOKIE, sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: event.url.protocol === 'https:',
        maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
      });

      return { sessionId };
    } catch (error) {
      console.error('[tracking] create_session failed:', error);
      return { sessionId: null };
    }
  }
);
```

Note: `SESSION_COOKIE` and `SESSION_EXPIRY_DAYS` already exist at line 15 in this file. Keep that as-is, don't duplicate.

**Step 2: Verify no type errors**

Run: `bun run check`
Expected: 0 errors (the old `save_consent` import in `consent.svelte.ts` will break — that's expected, fixed in Task 3)

**Step 3: Commit**

```bash
git add src/lib/tracking/tracking.remote.ts
git commit -m "feat: add create_session remote function, remove save_consent"
```

---

### Task 3: Update consent store to use `create_session` with buffered params

**Files:**
- Modify: `src/lib/tracking/consent.svelte.ts`

**Step 1: Replace `persistToServer` with session creation logic**

Replace the `persistToServer` function (lines 42-49) with:

```ts
async function createSessionOnServer(state: ConsentState): Promise<void> {
  try {
    const { getBufferedParams, clearBufferedParams } = await import('./param-buffer');
    const { create_session } = await import('./tracking.remote');

    const params = getBufferedParams();

    await create_session({
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
git commit -m "feat: consent store calls create_session with buffered params"
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
```

All should return 0 results.

**Step 4: Verify the tracking.remote.ts still imports getTrackingSession from capture-params**

```bash
grep "getTrackingSession" src/lib/tracking/tracking.remote.ts
```

Expected: `import { getTrackingSession } from './capture-params';`

**Step 5: Commit (if any cleanup needed)**

```bash
git commit -m "chore: final cleanup for consent-gated sessions"
```
