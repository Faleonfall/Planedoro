<template>
  <div class="timer-view min-h-screen flex flex-col justify-center items-center space-y-6 background-plane">
    <div class="glass-card flex flex-col items-center space-y-3">
      <div class="flex items-center text-9xl font-cockpit tabular-nums pb-3 select-none">
        <span ref="minutesEl" class="text-plane-accent w-[2ch] text-center inline-block">
          {{ shownMinutes }}
        </span>

        <span class="text-plane-dot w-[1ch] text-center inline-block">:</span>

        <span ref="secondsEl" class="text-plane-accent w-[2ch] text-center inline-block">
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
      <source src="../assets/sound.mp3" type="audio/mpeg"/>
      <source src="../assets/sound.ogg" type="audio/ogg"/>
    </audio>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useTimer} from "../composables/useTimer";
import {useKeyboardShortcuts} from "../composables/useKeyboardShortcuts";
import {useDigitFadeSwap} from "../animations/useDigitFadeSwap";

const audioEl = ref<HTMLAudioElement | null>(null);

function playChime() {
  const audio = audioEl.value;
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {
  });
}

function stopChime() {
  const audio = audioEl.value;
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

const {
  isRunning,
  resetKey,
  formattedMinutes,
  formattedSeconds,
  toggle,
  reset,
} = useTimer();

const toggleWithChime = () => {
  if (isRunning.value) stopChime();
  toggle(playChime);
};

const resetWithChime = () => {
  stopChime();
  reset();
};

useKeyboardShortcuts(toggleWithChime, resetWithChime);

const minutesEl = ref<HTMLElement | null>(null);
const secondsEl = ref<HTMLElement | null>(null);

const {shownMinutes, shownSeconds} = useDigitFadeSwap({
  minutesEl,
  secondsEl,
  formattedMinutes,
  formattedSeconds,
  resetKey,
  dur: 0.15, // 0.15 + tiny smoother
  ease: "power1.out",
});
</script>
