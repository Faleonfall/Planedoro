<template>
  <div ref="menuRootEl" class="settings-menu">
    <button
      type="button"
      class="cyber-btn settings-menu__trigger"
      aria-label="Open settings"
      :aria-expanded="show ? 'true' : 'false'"
      @click="togglePopup"
      @keydown.esc="hidePopup"
    >
      <span class="settings-menu__bars" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <div
      v-if="isRendered"
      ref="popupEl"
      class="settings-menu__panel"
      role="dialog"
      aria-label="Settings"
      tabindex="-1"
      @keydown.esc="hidePopup"
    >
      <div class="settings-menu__header">
        <p class="settings-menu__meta">Planedoro</p>
        <h2 class="settings-menu__title">Settings</h2>
      </div>

      <section class="settings-menu__section">
        <button
          type="button"
          class="settings-menu__cycle-button"
          :class="{ 'settings-menu__cycle-button--pulse': isPresetCycling }"
          :aria-label="`Switch focus cycle. Current mode: ${timerPresetLabel}`"
          @animationend="isPresetCycling = false"
          @click="cycleTimerPreset"
        >
          <p class="settings-menu__meta">Focus cycle</p>
          <p class="settings-menu__value">{{ timerPresetLabel }}</p>
        </button>
      </section>

      <section class="settings-menu__section">
        <div class="settings-menu__row">
          <div
            class="settings-menu__sound-copy"
            :class="{ 'settings-menu__sound-copy--disabled': !chimeEnabled }"
          >
            <p class="settings-menu__meta">Sound</p>
            <p class="settings-menu__value">
              Chime
              <span ref="soundValueEl" class="settings-menu__value-word">
                {{ soundValue }}
              </span>
            </p>
          </div>

          <button
            type="button"
            class="settings-menu__led"
            :class="{ 'settings-menu__led--active': chimeEnabled }"
            :aria-pressed="chimeEnabled ? 'true' : 'false'"
            :aria-label="chimeEnabled ? 'Disable chime' : 'Enable chime'"
            @click="toggleChime"
          >
            <span class="settings-menu__led-core"></span>
          </button>
        </div>
      </section>

      <section class="settings-menu__section settings-menu__section--muted">
        <p class="settings-menu__meta">Tip</p>
        <p class="settings-menu__value">
          Tap the focus cycle time to switch modes
        </p>
      </section>

      <div class="settings-menu__footer">
        <a
          href="https://github.com/Faleonfall/Planedoro"
          class="settings-menu__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue";
import { useSettingsMenuMotion } from "../composables/useSettingsMenuMotion";

const props = defineProps<{
  chimeEnabled: boolean;
  timerPresetLabel: string;
}>();

const emit = defineEmits<{
  "update:chimeEnabled": [value: boolean];
  cycleTimerPreset: [];
}>();

const menuRootEl = ref<HTMLElement | null>(null);
const popupEl = ref<HTMLElement | null>(null);
const soundValueEl = ref<HTMLElement | null>(null);
const isPresetCycling = ref(false);

const { hidePopup, isRendered, show, soundValue, togglePopup } =
  useSettingsMenuMotion({
    chimeEnabled: toRef(props, "chimeEnabled"),
    menuRootEl,
    popupEl,
    soundValueEl,
  });

function toggleChime() {
  emit("update:chimeEnabled", !props.chimeEnabled);
}

function cycleTimerPreset() {
  isPresetCycling.value = false;
  requestAnimationFrame(() => {
    isPresetCycling.value = true;
  });
  emit("cycleTimerPreset");
}
</script>

<style scoped src="../styles/settings-menu.css"></style>
