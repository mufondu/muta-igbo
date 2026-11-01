// Privacy-safe usage tracking. Fire-and-forget; never throws, never blocks the UI.
// RULE: props may contain only non-identifying values (ids of lessons, counts, scores).
// Never put a child's name, age, or any free text in props.
import { supabase } from './supabase';

let currentUserId: string | null = null;

export function setAnalyticsUser(id: string | null) {
  currentUserId = id;
}

type Props = Record<string, string | number | boolean | null>;

export function track(event: string, props: Props = {}) {
  if (!supabase || !currentUserId) return;
  supabase
    .from('usage_events')
    .insert({ user_id: currentUserId, event: event.slice(0, 64), props })
    .then(
      () => {},
      () => {},
    );
}
