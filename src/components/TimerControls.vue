<template>
  <div class="flex flex-col items-center space-y-3">
    <div class="flex space-x-12">
      <button class="cyber-btn select-none" @click="$emit('toggle')">
        {{ isRunning ? "Stop" : "Start" }}
      </button>
      <button class="cyber-btn select-none" @click="$emit('reset')">
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isRunning: boolean;
}>();

defineEmits<{
  toggle: [];
  reset: [];
}>();
</script>
