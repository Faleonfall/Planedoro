<template>
  <div class="flex flex-col items-center space-y-3">
    <div class="flex space-x-12">
      <button
        type="button"
        :class="buttonClass(togglePressed)"
        @mousedown="emit('mouse-hold-change', true)"
        @click="emitIfUnlocked('toggle')"
      >
        {{ isRunning ? "Stop" : "Start" }}
      </button>
      <button
        type="button"
        :class="buttonClass(resetPressed)"
        @mousedown="emit('mouse-hold-change', true)"
        @click="emitIfUnlocked('reset')"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  toggle: [];
  reset: [];
  "mouse-hold-change": [held: boolean];
}>();

const props = defineProps<{
  isRunning: boolean;
  togglePressed: boolean;
  resetPressed: boolean;
  interactionLocked: boolean;
}>();

function buttonClass(pressed: boolean) {
  return [
    "cyber-btn timer-controls__button select-none",
    {
      "timer-controls__button--pressed": pressed,
      "timer-controls__button--locked": props.interactionLocked,
    },
  ];
}

function emitIfUnlocked(event: "toggle" | "reset") {
  if (props.interactionLocked) return;
  if (event === "toggle") {
    emit("toggle");
    return;
  }

  emit("reset");
}
</script>
