import type { TimerPreset } from "../config/timerConfig";
import type { TimerSessionSnapshot } from "./useTimer";

const TIMER_SESSION_STORAGE_KEY = "planedoro.timerSession";
export const ACCIDENTAL_RESTORE_WINDOW_MS = 2 * 60 * 1000;

type StoredTimerSession = TimerSessionSnapshot & {
  presetId: TimerPreset["id"];
};

export function readTimerSession() {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(TIMER_SESSION_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as StoredTimerSession;
  } catch {
    return null;
  }
}

export function writeTimerSession(
  snapshot: TimerSessionSnapshot,
  presetId: TimerPreset["id"],
) {
  if (typeof window === "undefined") return;

  const storedSession: StoredTimerSession = {
    ...snapshot,
    presetId,
  };

  window.localStorage.setItem(
    TIMER_SESSION_STORAGE_KEY,
    JSON.stringify(storedSession),
  );
}

export function clearTimerSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TIMER_SESSION_STORAGE_KEY);
}
