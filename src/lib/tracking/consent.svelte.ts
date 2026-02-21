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
  let bannerVisible = $state(false);

  const hasConsented = $derived(state !== null);
  const marketing = $derived(state?.marketing ?? false);
  const analytics = $derived(state?.analytics ?? false);

  function apply(newState: ConsentState): void {
    state = newState;
    writeToCookie(newState);
    persistToServer(newState);
    bannerVisible = false;
  }

  return {
    get state() { return state; },
    get hasConsented() { return hasConsented; },
    get marketing() { return marketing; },
    get analytics() { return analytics; },
    get bannerVisible() { return bannerVisible || !hasConsented; },

    showBanner() { bannerVisible = true; },
    hideBanner() { bannerVisible = false; },

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
