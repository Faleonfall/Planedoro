import { ref, watch } from "vue";
import {
  DEFAULT_TIMER_PRESET,
  TIMER_PRESETS,
  type TimerPreset,
} from "../config/timerConfig";

const STORAGE_KEYS = {
  chimeEnabled: "planedoro.chimeEnabled",
  timerPresetId: "planedoro.timerPresetId",
} as const;

function readStoredChimeEnabled() {
  if (typeof window === "undefined") return true;

  const rawValue = window.localStorage.getItem(STORAGE_KEYS.chimeEnabled);

  if (rawValue === null) return true;

  try {
    return JSON.parse(rawValue) === true;
  } catch {
    return true;
  }
}

function readStoredPresetIndex() {
  if (typeof window === "undefined") return 0;

  const storedPresetId = window.localStorage.getItem(STORAGE_KEYS.timerPresetId);

  if (!storedPresetId) return 0;

  const matchedIndex = TIMER_PRESETS.findIndex(
    (preset) => preset.id === storedPresetId,
  );

  return matchedIndex >= 0 ? matchedIndex : 0;
}

export function useTimerPreferences() {
  const chimeEnabled = ref(readStoredChimeEnabled());
  const timerPresetIndex = ref(readStoredPresetIndex());

  watch(chimeEnabled, (value) => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      STORAGE_KEYS.chimeEnabled,
      JSON.stringify(value),
    );
  });

  watch(timerPresetIndex, (index) => {
    if (typeof window === "undefined") return;

    const preset: TimerPreset = TIMER_PRESETS[index] ?? DEFAULT_TIMER_PRESET;
    window.localStorage.setItem(STORAGE_KEYS.timerPresetId, preset.id);
  });

  return {
    chimeEnabled,
    timerPresetIndex,
  };
}
