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

export const handle: Handle = sequence(handleTracking, handleParaglide);
