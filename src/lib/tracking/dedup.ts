/**
 * Event Deduplication
 * Generates random event IDs for client-server deduplication.
 * Both client Pixel and server CAPI receive the same ID from the caller.
 * Meta deduplicates by event_name + event_id within 48h window.
 */

/**
 * Generate a unique event ID for deduplication.
 * Called once per user action - the same ID is passed to both
 * the client-side Pixel and the server-side remote function.
 */
export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
