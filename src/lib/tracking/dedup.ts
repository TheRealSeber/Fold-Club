/**
 * Event Deduplication
 * Generates deterministic event IDs so client Pixel and server CAPI
 * produce the same ID for the same user action.
 * Meta deduplicates by event_name + event_id within 48h window.
 */

/**
 * Generate a deterministic event ID.
 * Same inputs always produce the same ID — client and server can
 * independently generate matching IDs without communicating.
 */
export function generateEventId(
  eventName: string,
  entityId: string,
  sessionId: string
): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${eventName}_${entityId}_${sessionId}_${date}`;
}

/**
 * Read fc_session cookie value from document.cookie (client-side).
 */
export function getSessionIdFromCookie(): string {
  if (typeof document === 'undefined') return 'unknown';
  const match = document.cookie.match(/(?:^|;\s*)fc_session=([^;]*)/);
  return match?.[1] ?? 'unknown';
}
