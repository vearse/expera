import type { TeacherVoiceEvent } from "./types";

type TeacherVoiceListener = (event: TeacherVoiceEvent) => void;

const listeners = new Set<TeacherVoiceListener>();
const bufferedEvents: TeacherVoiceEvent[] = [];
const MAX_BUFFERED_EVENTS = 50;

export function emitTeacherEvent(event: TeacherVoiceEvent) {
  if (listeners.size === 0) {
    bufferedEvents.push(event);
    if (bufferedEvents.length > MAX_BUFFERED_EVENTS) bufferedEvents.shift();
    return;
  }
  for (const listener of listeners) listener(event);
}

export function subscribeTeacherEvents(listener: TeacherVoiceListener) {
  listeners.add(listener);
  if (bufferedEvents.length > 0) {
    const queued = bufferedEvents.splice(0);
    for (const event of queued) listener(event);
  }
  return () => {
    listeners.delete(listener);
  };
}

export function clearTeacherEventBufferForTests() {
  bufferedEvents.length = 0;
  listeners.clear();
}
