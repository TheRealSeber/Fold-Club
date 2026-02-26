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
    landingPage: url.pathname
  };

  // Check attribution params only (exclude landingPage which is always non-null)
  const hasAttribution = [
    params.fbclid, params.gclid, params.ttclid,
    params.utmSource, params.utmMedium, params.utmCampaign,
    params.utmContent, params.utmTerm
  ].some((v) => v !== null);

  // Only write if we have new attribution params, OR if nothing is buffered yet (capture landing page)
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (hasAttribution || !existing) {
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
