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
