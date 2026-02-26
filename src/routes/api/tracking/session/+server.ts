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
        marketing: consent.marketing
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
      expiresAt
    });

    // Record consent
    await db.insert(consentRecords).values({
      sessionId,
      necessary: consent.necessary,
      analytics: consent.analytics,
      marketing: consent.marketing
    });

    // Set httpOnly cookie — this works in +server.ts (unlike command())
    cookies.set(SESSION_COOKIE, sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60
    });

    return json({ sessionId });
  } catch (error) {
    console.error('[tracking] create_session failed:', error);
    return json({ sessionId: null }, { status: 500 });
  }
};
