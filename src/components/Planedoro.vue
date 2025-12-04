<template>
  <div class="min-h-screen flex flex-col justify-center items-center space-y-6 background-plane">
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
        <button class="cyber-btn select-none" @click="toggle">
          {{ isRunning ? "Stop" : "Start" }}
        </button>
        <button class="cyber-btn select-none" @click="reset">
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
import {useKeyboardShortcuts} from "../composables/useKeyboardShortcuts";
import {ref, computed, onBeforeUnmount} from "vue";

const WORK_MINUTES = 50;
const BREAK_MINUTES = 10;
const CHIME_OFFSET_MS = 1000 - 220;

const isRunning = ref(false);
const workState = ref(true); // true = work, false = break
const timeLeft = ref(WORK_MINUTES * 60); // seconds

const resetKey = ref(0);

let intervalId: ReturnType<typeof setInterval> | null = null;
const audioEl = ref<HTMLAudioElement | null>(null);

const formattedMinutes = computed(() =>
    String(Math.floor(timeLeft.value / 60)).padStart(2, "0")
);
const formattedSeconds = computed(() =>
    String(timeLeft.value % 60).padStart(2, "0")
);

function playChime() {
  const audio = audioEl.value;
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {
    });
  }
}

function startTimer() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (timeLeft.value === 3) {
      setTimeout(playChime, CHIME_OFFSET_MS);
    }
    if (timeLeft.value > 0) {
      timeLeft.value -= 1;
    } else {
      workState.value = !workState.value;
      timeLeft.value = (workState.value ? WORK_MINUTES : BREAK_MINUTES) * 60;
    }
  }, 1000);
}

function stopTimer() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

function toggle() {
  isRunning.value = !isRunning.value;
  if (isRunning.value) {
    startTimer();
  } else {
    stopTimer();
  }
}

function reset() {
  stopTimer();
  isRunning.value = false;
  workState.value = true;
  timeLeft.value = WORK_MINUTES * 60;
  resetKey.value++; // Always triggers the fade animation
}

useKeyboardShortcuts(toggle, reset);

onBeforeUnmount(stopTimer);
</script>

<style scoped>
.background-plane {
  background: url('../assets/plane.jpg') center center / cover no-repeat;
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  inset: 0;
  z-index: -1;
}

.glass-card {
  background: var(--color-plane-glass); /* dark, but transparent */
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border-radius: 2rem;
  box-shadow: 0 0 0 3px var(--color-plane-accent),
  0 0 8px 2px var(--color-plane-accent);
  padding: 2.5rem 4rem 1.75rem;
  margin: 2rem 0;
}

.text-9xl {
  font-size: 11rem !important;
  text-shadow: 0 0 2px rgba(var(--color-plane-accent-rgb), 0.8),
  0 0 3px rgba(var(--color-plane-accent-rgb), 0.6),
  0 0 6px rgba(var(--color-plane-accent-rgb), 0.3);
}

.text-plane-dot {
  color: var(--color-plane-dot);
  /* Add the neon shadow, like blue digits but yellow */
  text-shadow: 0 0 2px rgba(var(--color-plane-dot-rgb), 0.8),
  0 0 3px rgba(var(--color-plane-dot-rgb), 0.6),
  0 0 8px rgba(var(--color-plane-dot-rgb), 0.3);
}

.digit-fade-enter-active,
.digit-fade-leave-active {
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.digit-fade-enter-from,
.digit-fade-leave-to {
  opacity: 0;
}

.cyber-btn {
  position: relative;
  color: var(--color-plane-dot);
  background: var(--color-plane-glass);
  font-family: var(--font-cockpit), sans-serif;
  min-width: 13.5rem;
  text-align: center;
  transition: background 0.21s, color 0.21s, box-shadow 0.19s;
  overflow: hidden;
  padding: 0.75rem 3rem;
  border: none;
  border-radius: 1.125rem;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.15em;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 0 0 3px var(--color-plane-accent),
  0 0 8px 2px var(--color-plane-accent);
  text-shadow: 0 0 1px rgba(var(--color-plane-dot-rgb), 0.8),
  0 0 3px rgba(var(--color-plane-dot-rgb), 0.6),
  0 0 6px rgba(var(--color-plane-dot-rgb), 0.3);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.cyber-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
  box-shadow: 0 0 21px 9px var(--color-plane-accent);
  filter: blur(3px);
  transition: opacity 0.2s;
}

@media (hover: hover) and (pointer: fine) {
  .cyber-btn:hover {
    background: var(--color-plane-accent);
    color: var(--color-plane-glass);
    box-shadow: 0 0 0 3px var(--color-plane-accent),
    0 0 8px 5px var(--color-plane-accent);
    text-shadow: none;
  }

  .cyber-btn:hover::before {
    opacity: 0.85;
  }
}

@media (hover: none) and (pointer: coarse) {
  .cyber-btn {
    transition: background 0.25s cubic-bezier(.65, 0, .2, 1),
    box-shadow 0.25s cubic-bezier(.8, .12, .19, 1),
    color 0.15s,
    transform 0.2s cubic-bezier(.8, .12, .19, 1);
  }
}

.cyber-btn:active {
  background: var(--color-plane-accent);
  color: var(--color-plane-glass);
  box-shadow: 0 0 0 3px var(--color-plane-accent),
  0 0 24px 5px var(--color-plane-accent);
  transition: none;
  text-shadow: none;
}
</style>
