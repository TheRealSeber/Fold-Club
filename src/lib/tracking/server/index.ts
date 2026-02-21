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
