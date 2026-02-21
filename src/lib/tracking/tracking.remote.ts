/**
 * Server-Side Tracking Remote Functions
 * Called from client components via command() — execute on server.
 * Read fc_session cookie, look up tracking session, fire CAPI events.
 */

import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { getTrackingSession } from './capture-params';
import { serverTracker } from './server';
import { db } from '$lib/server/db';
import { consentRecords } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

const SESSION_COOKIE = 'fc_session';

async function getLatestConsent(sessionId: string) {
  const [consent] = await db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.sessionId, sessionId))
    .orderBy(desc(consentRecords.createdAt))
    .limit(1);
  return consent ?? null;
}

export const track_view_content = command(
  v.object({
    productId: v.string(),
    productName: v.string(),
    price: v.number(),
    eventId: v.string(),
    sourceUrl: v.string(),
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
            fbclid: session.fbclid,
          },
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
    sourceUrl: v.string(),
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
            fbclid: session.fbclid,
          },
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
    sourceUrl: v.string(),
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
            fbclid: session.fbclid,
          },
        });
      }
    } catch (error) {
      console.error('[tracking] track_checkout failed:', error);
    }
    return { tracked: true };
  }
);

export const save_consent = command(
  v.object({
    necessary: v.boolean(),
    analytics: v.boolean(),
    marketing: v.boolean(),
  }),
  async ({ necessary, analytics, marketing }) => {
    try {
      const event = getRequestEvent();
      const sessionId = event.cookies.get(SESSION_COOKIE);
      if (!sessionId) return { saved: false };

      await db.insert(consentRecords).values({
        sessionId,
        necessary,
        analytics,
        marketing,
      });

      return { saved: true };
    } catch (error) {
      console.error('[tracking] save_consent failed:', error);
      return { saved: false };
    }
  }
);
