/**
 * Server-Side Tracking Remote Functions
 * Called from client components via command() - execute on server.
 * Read fc_session cookie, look up tracking session, fire CAPI events.
 */

import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { v7 as uuidv7 } from 'uuid';
import { getTrackingSession } from '$lib/tracking/capture-params';
import { serverTracker } from '$lib/tracking/server';
import { db } from '$lib/server/db';
import { trackingSessions, consentRecords } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

const SESSION_COOKIE = 'fc_session';
const SESSION_EXPIRY_DAYS = 30;

async function getLatestConsent(sessionId: string) {
  const [consent] = await db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.sessionId, sessionId))
    .orderBy(desc(consentRecords.createdAt))
    .limit(1);
  return consent ?? null;
}

export const create_session = command(
  v.object({
    consent: v.object({
      necessary: v.boolean(),
      analytics: v.boolean(),
      marketing: v.boolean()
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
      landingPage: v.nullable(v.string())
    })
  }),
  async ({ consent, params }) => {
    const event = getRequestEvent();
    const { cookies } = event;

    // Check if session already exists (user re-consenting)
    const existingSessionId = cookies.get(SESSION_COOKIE);
    if (existingSessionId) {
      // Verify session still exists in DB (may have been deleted/expired)
      const [existingSession] = await db
        .select({ sessionId: trackingSessions.sessionId })
        .from(trackingSessions)
        .where(eq(trackingSessions.sessionId, existingSessionId))
        .limit(1);

      if (existingSession) {
        const fbc = cookies.get('_fbc') ?? null;
        const fbp = cookies.get('_fbp') ?? null;

        // Last-click attribution: update session params if new attribution arrived
        const hasAttribution = [
          params.fbclid, params.gclid, params.ttclid,
          params.utmSource, params.utmMedium, params.utmCampaign,
          params.utmContent, params.utmTerm
        ].some((p) => p !== null);

        await db.transaction(async (tx) => {
          if (hasAttribution || fbc || fbp) {
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

            // Extend session expiry on re-attribution
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
            updateData.expiresAt = expiresAt;

            await tx
              .update(trackingSessions)
              .set(updateData)
              .where(eq(trackingSessions.sessionId, existingSessionId));
          }

          await tx.insert(consentRecords).values({
            sessionId: existingSessionId,
            necessary: consent.necessary,
            analytics: consent.analytics,
            marketing: consent.marketing
          });
        });

        return { sessionId: existingSessionId };
      }

      // Session cookie exists but DB row is gone — clear stale cookie, fall through to create new
      cookies.delete(SESSION_COOKIE, { path: '/' });
    }

    // Create new session
    const sessionId = uuidv7();
    const request = event.request;
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null;
    const userAgent = request.headers.get('user-agent');
    const fbc = cookies.get('_fbc') ?? null;
    const fbp = cookies.get('_fbp') ?? null;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await db.transaction(async (tx) => {
      await tx.insert(trackingSessions).values({
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

      await tx.insert(consentRecords).values({
        sessionId,
        necessary: consent.necessary,
        analytics: consent.analytics,
        marketing: consent.marketing
      });
    });

    // Set httpOnly cookie
    cookies.set(SESSION_COOKIE, sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: event.url.protocol === 'https:',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60
    });

    return { sessionId };
  }
);

export const track_view_content = command(
  v.object({
    productId: v.string(),
    productName: v.string(),
    price: v.number(),
    eventId: v.string(),
    sourceUrl: v.string()
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
            fbclid: session.fbclid
          }
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
    sourceUrl: v.string()
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
            fbclid: session.fbclid
          }
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
    sourceUrl: v.string()
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
            fbclid: session.fbclid
          }
        });
      }
    } catch (error) {
      console.error('[tracking] track_checkout failed:', error);
    }
    return { tracked: true };
  }
);
