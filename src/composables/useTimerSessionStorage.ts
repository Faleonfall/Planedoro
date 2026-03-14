import { TIMER_PRESETS, type TimerPreset } from "../config/timerConfig";
import type { TimerSessionSnapshot } from "./useTimer";

const TIMER_SESSION_STORAGE_KEY = "planedoro.timerSession";
export const ACCIDENTAL_RESTORE_WINDOW_MS = 2 * 60 * 1000;

type StoredTimerSession = TimerSessionSnapshot & {
  presetId: TimerPreset["id"];
};

function isStoredTimerSession(value: unknown): value is StoredTimerSession {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<StoredTimerSession>;
  const hasKnownPreset = TIMER_PRESETS.some(
    (preset) => preset.id === session.presetId,
  );

  return (
    typeof session.isRunning === "boolean" &&
    typeof session.pausedMsLeft === "number" &&
    Number.isFinite(session.pausedMsLeft) &&
    session.pausedMsLeft >= 0 &&
    typeof session.savedAtMs === "number" &&
    Number.isFinite(session.savedAtMs) &&
    typeof session.workState === "boolean" &&
    hasKnownPreset
  );
}

export function readTimerSession() {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(TIMER_SESSION_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isStoredTimerSession(parsedValue)) {
      clearTimerSession();
      return null;
    }

    return parsedValue;
  } catch {
    clearTimerSession();
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
