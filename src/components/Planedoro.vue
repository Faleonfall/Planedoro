<template>
  <div
    class="timer-view min-h-screen flex flex-col justify-center items-center space-y-6 background-plane"
  >
    <SettingsMenu
      v-model:chime-enabled="chimeEnabled"
      :timer-preset-label="timerPreset.label"
      @cycle-timer-preset="cycleTimerPreset"
    />

    <div class="glass-card flex flex-col items-center space-y-3">
      <div
        class="flex items-center text-9xl font-cockpit tabular-nums pb-3 select-none"
      >
        <span
          ref="minutesEl"
          class="text-plane-accent w-[2ch] text-center inline-block"
        >
          {{ shownMinutes }}
        </span>

        <span class="text-plane-dot w-[1ch] text-center inline-block">:</span>

        <span
          ref="secondsEl"
          class="text-plane-accent w-[2ch] text-center inline-block"
        >
          {{ shownSeconds }}
        </span>
      </div>
    </div>

    <div class="flex flex-col items-center space-y-3">
      <div class="flex space-x-12">
        <button class="cyber-btn select-none" @click="toggleWithChime">
          {{ isRunning ? "Stop" : "Start" }}
        </button>
        <button class="cyber-btn select-none" @click="resetWithChime">
          Reset
        </button>
      </div>
    </div>

    <audio ref="audioEl" preload="auto">
      <source src="../assets/sound.mp3" type="audio/mpeg" />
      <source src="../assets/sound.ogg" type="audio/ogg" />
    </audio>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { DEFAULT_TIMER_PRESET, TIMER_PRESETS } from "../config/timerConfig";
import { useTimer } from "../composables/useTimer";
import { useKeyboardShortcuts } from "../composables/useKeyboardShortcuts";
import { useChimeAudio } from "../composables/useChimeAudio";
import { useDigitFadeSwap } from "../animations/useDigitFadeSwap";
import SettingsMenu from "./SettingsMenu.vue";

const audioEl = ref<HTMLAudioElement | null>(null);
const chimeEnabled = ref(true);
const timerPresetIndex = ref(0);
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
  resetKey,
  formattedMinutes,
  formattedSeconds,
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

useKeyboardShortcuts(toggleWithChime, resetWithChime);

const minutesEl = ref<HTMLElement | null>(null);
const secondsEl = ref<HTMLElement | null>(null);

const { shownMinutes, shownSeconds } = useDigitFadeSwap({
  minutesEl,
  secondsEl,
  formattedMinutes,
  formattedSeconds,
  resetKey,
  dur: 0.15, // 0.15 + tiny smoother
  ease: "power1.out",
});
</script>
