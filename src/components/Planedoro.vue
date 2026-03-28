<template>
  <div
    class="timer-view min-h-screen flex flex-col justify-center items-center space-y-6 background-plane"
  >
    <SettingsMenu
      v-model:chime-enabled="chimeEnabled"
      :timer-preset-label="timerPreset.label"
      @cycle-timer-preset="cycleTimerPreset"
    />

    <TimerDisplay
      v-model:minutes-el="minutesEl"
      v-model:seconds-el="secondsEl"
      :minutes="shownMinutes"
      :seconds="shownSeconds"
    />

    <TimerControls
      :is-running="isRunning"
      :toggle-pressed="togglePressed"
      :reset-pressed="resetPressed"
      :interaction-locked="togglePressed || resetPressed"
      @mouse-hold-change="mouseHeld = $event"
      @toggle="toggleWithChime"
      @reset="resetWithChime"
    />

    <audio ref="audioEl" preload="auto">
      <source src="../assets/sound.mp3" type="audio/mpeg" />
      <source src="../assets/sound.ogg" type="audio/ogg" />
    </audio>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { DEFAULT_TIMER_PRESET, TIMER_PRESETS } from "../config/timerConfig";
import { useTimer } from "../composables/useTimer";
import { useKeyboardShortcuts } from "../composables/useKeyboardShortcuts";
import { useChimeAudio } from "../composables/useChimeAudio";
import { useTimerPreferences } from "../composables/useTimerPreferences";
import {
  ACCIDENTAL_RESTORE_WINDOW_MS,
  clearTimerSession,
  readTimerSession,
  writeTimerSession,
} from "../composables/useTimerSessionStorage";
import { useDigitFadeSwap } from "../animations/useDigitFadeSwap";
import SettingsMenu from "./SettingsMenu.vue";
import TimerControls from "./TimerControls.vue";
import TimerDisplay from "./TimerDisplay.vue";

const audioEl = ref<HTMLAudioElement | null>(null);
const { chimeEnabled, timerPresetIndex } = useTimerPreferences();
const timerPreset = computed(
  () => TIMER_PRESETS[timerPresetIndex.value] ?? DEFAULT_TIMER_PRESET,
);
const workMinutes = computed(() => timerPreset.value.workMinutes);
const breakMinutes = computed(() => timerPreset.value.breakMinutes);
const { playChime, stopChime } = useChimeAudio({
  audioEl,
  isEnabled: chimeEnabled,
});

const {
  isRunning,
  workState,
  resetKey,
  formattedMinutes,
  formattedSeconds,
  getSnapshot,
  hydrate,
  toggle,
  reset,
} = useTimer({
  workMinutes,
  breakMinutes,
});

const toggleWithChime = () => {
  if (isRunning.value) stopChime();
  toggle(playChime);
};

const resetWithChime = () => {
  stopChime();
  reset();
};

function persistTimerSession() {
  writeTimerSession(getSnapshot(), timerPreset.value.id);
}

function cycleTimerPreset() {
  timerPresetIndex.value = (timerPresetIndex.value + 1) % TIMER_PRESETS.length;
}

watch(chimeEnabled, (enabled) => {
  if (!enabled) {
    stopChime();
  }
});

watch(timerPresetIndex, () => {
  stopChime();
  reset();
});

watch([isRunning, workState, timerPresetIndex, resetKey], () => {
  persistTimerSession();
});

const togglePressed = ref(false);
const resetPressed = ref(false);
const mouseHeld = ref(false);

useKeyboardShortcuts(
  toggleWithChime,
  resetWithChime,
  (pressed) => {
    togglePressed.value = pressed;
  },
  (pressed) => {
    resetPressed.value = pressed;
  },
  () => mouseHeld.value,
);

const minutesEl = ref<HTMLElement | null>(null);
const secondsEl = ref<HTMLElement | null>(null);

const {
  shownMinutes,
  shownSeconds,
  syncNow: syncDigitsNow,
} = useDigitFadeSwap({
  minutesEl,
  secondsEl,
  formattedMinutes,
  formattedSeconds,
  resetKey,
  dur: 0.15, // 0.15 + tiny smoother
  ease: "power1.out",
});

function handlePageHide() {
  persistTimerSession();
}

function handleGlobalMouseUp() {
  mouseHeld.value = false;
}

onMounted(() => {
  const storedSession = readTimerSession();

  if (
    storedSession &&
    storedSession.presetId === timerPreset.value.id &&
    storedSession.pausedMsLeft > 0
  ) {
    if (storedSession.isRunning) {
      const elapsedSinceSave = Date.now() - storedSession.savedAtMs;
      const wasRecentlyInterrupted =
        elapsedSinceSave <= ACCIDENTAL_RESTORE_WINDOW_MS;

      if (wasRecentlyInterrupted) {
        const remainingMs = Math.max(
          0,
          storedSession.pausedMsLeft - elapsedSinceSave,
        );

        hydrate({
          pausedMsLeft: remainingMs,
          workState: storedSession.workState,
        });
        syncDigitsNow();
      } else {
        clearTimerSession();
      }
    } else {
      hydrate({
        pausedMsLeft: storedSession.pausedMsLeft,
        workState: storedSession.workState,
      });
      syncDigitsNow();
    }
  }

  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("beforeunload", handlePageHide);
  window.addEventListener("mouseup", handleGlobalMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("pagehide", handlePageHide);
  window.removeEventListener("beforeunload", handlePageHide);
  window.removeEventListener("mouseup", handleGlobalMouseUp);
});
</script>
