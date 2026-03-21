<template>
  <div class="glass-card flex flex-col items-center space-y-3">
    <div
      class="flex items-center text-9xl font-cockpit tabular-nums pb-3 select-none"
    >
      <span
        ref="minutesEl"
        class="text-plane-accent w-[2ch] text-center inline-block"
      >
        {{ minutes }}
      </span>

      <span class="text-plane-dot w-[1ch] text-center inline-block">:</span>

      <span
        ref="secondsEl"
        class="text-plane-accent w-[2ch] text-center inline-block"
      >
        {{ seconds }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  minutes: string;
  seconds: string;
}>();

const minutesEl = defineModel<HTMLElement | null>("minutesEl", {
  default: null,
});
const secondsEl = defineModel<HTMLElement | null>("secondsEl", {
  default: null,
});

void minutesEl;
void secondsEl;
</script>
