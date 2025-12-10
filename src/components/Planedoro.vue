<template>
  <div class="timer-view min-h-screen flex flex-col justify-center items-center space-y-6 background-plane">
    <div class="glass-card flex flex-col items-center space-y-3">
      <div class="flex items-center text-9xl font-cockpit tabular-nums pb-3 select-none">
        <transition name="digit-fade" mode="out-in">
          <span
              class="text-plane-accent w-[2ch] text-center inline-block"
              :key="formattedMinutes + '-' + resetKey"
          >{{ formattedMinutes }}</span>
        </transition>

        <span class="text-plane-dot w-[1ch] text-center inline-block">:</span>

        <transition name="digit-fade" mode="out-in">
          <span
              class="text-plane-accent w-[2ch] text-center inline-block"
              :key="formattedSeconds + '-' + resetKey"
          >{{ formattedSeconds }}</span>
        </transition>
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
  // If we are stopping, also stop any currently playing countdown sound
  if (isRunning.value) stopChime();
  toggle(playChime);
};

const resetWithChime = () => {
  stopChime();
  reset();
};

useKeyboardShortcuts(toggleWithChime, resetWithChime);
</script>
