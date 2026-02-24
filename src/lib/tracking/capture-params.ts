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

      // Extend session expiry on re-attribution
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
      updateData.expiresAt = expiresAt;

      await db
        .update(trackingSessions)
        .set(updateData)
        .where(eq(trackingSessions.sessionId, existingSessionId));
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
    secure: event.url.protocol === 'https:',
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
