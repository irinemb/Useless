// ============================================================
// RITUAL.exe — Event Bus
// Canonical Event Contract strictly adhering to Section 5
// ============================================================

export type RitualEvent =
  | 'BEGIN_RITUAL'
  | 'EYE_CONTACT_PROGRESS'
  | 'EYE_CONTACT_LOST'
  | 'EYE_CONTACT_CONFIRMED'
  | 'VOCAL_MODE_SELECTED'
  | 'TWISTER_REP_DETECTED'
  | 'SINGING_SCORE_UPDATED'
  | 'VOCAL_ACCEPTED'
  | 'VOCAL_FALLBACK_ACCEPTED'
  | 'LOADING_PROGRESS'
  | 'MCQ_REQUIRED'
  | 'MCQ_ANSWERED'
  | 'SCREAM_DETECTED'
  | 'SCROLL_PULSE'
  | 'LETTER_CAUGHT'
  | 'MESSAGE_COMPLETE'
  | 'ENTER_CAUGHT'
  | 'REPLY_SHOWN'
  | 'VICTORY_STARTED'
  | 'VICTORY_FINISHED'
  | 'RECEIPT_SHOWN'
  | 'COMPLETION_RECORDED'
  | 'BATTERY_CHANGED'
  | 'RESET_RITUAL';

type Handler = (payload?: any) => void;

const listeners: Map<RitualEvent, Set<Handler>> = new Map();

export function emit(event: RitualEvent, payload?: any): void {
  const handlers = listeners.get(event);
  if (handlers) {
    handlers.forEach((h) => {
      try {
        h(payload);
      } catch (err) {
        console.error(`[RITUAL] Error in event listener for ${event}:`, err);
      }
    });
  }
}

export function subscribe(event: RitualEvent, handler: Handler): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler);
  return () => listeners.get(event)!.delete(handler);
}

export function subscribeMany(
  events: RitualEvent[],
  handler: Handler
): () => void {
  const unsubs = events.map((e) => subscribe(e, handler));
  return () => unsubs.forEach((u) => u());
}
