/**
 * Consent State - Svelte 5 Runes Store
 * Manages GDPR cookie consent with reactive state.
 * Reads from cookie on init, updates cookie + POSTs to server on change.
 *
 * SSR WARNING: This module-scope singleton is shared across all server
 * requests during SSR. The store reads from cookies (client-side only)
 * and returns null state on the server. ONLY read consent state in
 * client-side contexts ($effect, onMount, event handlers).
 * NEVER use consent.hasConsented in server-rendered template conditionals.
 */

import { browser } from '$app/environment';
import { getBufferedParams, clearBufferedParams } from '$lib/tracking/param-buffer';
import { create_session } from '$lib/tracking/tracking.remote';

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
  const secure = location.protocol === 'https:' ? ';secure' : '';
  document.cookie = `${COOKIE_NAME}=${value};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax${secure}`;
}

async function createSessionOnServer(state: ConsentState): Promise<void> {
  try {
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
        landingPage: null
      }
    });

    clearBufferedParams();
  } catch (error) {
    console.error('[consent] failed to create session:', error);
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
    createSessionOnServer(newState);
    bannerVisible = false;
  }

  return {
    get state() {
      return state;
    },
    get hasConsented() {
      return hasConsented;
    },
    get marketing() {
      return marketing;
    },
    get analytics() {
      return analytics;
    },
    get bannerVisible() {
      return browser && (bannerVisible || !hasConsented);
    },

    showBanner() {
      bannerVisible = true;
    },
    hideBanner() {
      bannerVisible = false;
    },

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
        marketing: partial.marketing ?? state?.marketing ?? false
      });
    }
  };
}

export const consent = createConsentStore();
