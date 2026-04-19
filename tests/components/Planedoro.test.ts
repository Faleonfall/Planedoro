import { computed, nextTick } from "vue";
import { shallowMount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Planedoro from "../../src/components/Planedoro.vue";

vi.mock("../../src/composables/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: () => {},
}));

vi.mock("../../src/composables/useChimeAudio", () => ({
  useChimeAudio: () => ({
    playChime: vi.fn(),
    stopChime: vi.fn(),
  }),
}));

vi.mock("../../src/animations/useDigitFadeSwap", () => ({
  useDigitFadeSwap: (opts: {
    formattedMinutes: { value: string };
    formattedSeconds: { value: string };
  }) => ({
    shownMinutes: computed(() => opts.formattedMinutes.value),
    shownSeconds: computed(() => opts.formattedSeconds.value),
    syncNow: vi.fn(),
  }),
}));

function setLocalStorageValues(values: Record<string, string>) {
  window.localStorage.clear();

  for (const [key, value] of Object.entries(values)) {
    window.localStorage.setItem(key, value);
  }
}

function mountPlanedoro() {
  return shallowMount(Planedoro, {
    global: {
      stubs: {
        SettingsMenu: true,
        TimerDisplay: {
          props: ["minutes", "seconds"],
          template: `<div>{{ minutes }}:{{ seconds }}</div>`,
        },
        TimerControls: {
          props: ["isRunning"],
          template: `<div>{{ isRunning ? "Stop" : "Start" }}</div>`,
        },
      },
    },
  });
}

describe("Planedoro recovery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00.000Z"));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("restores a recent running session as paused with adjusted remaining time", async () => {
    setLocalStorageValues({
      "planedoro.timerPresetId": "extended",
      "planedoro.timerSession": JSON.stringify({
        isRunning: true,
        pausedMsLeft: 120_000,
        savedAtMs: Date.now() - 30_000,
        workState: true,
        presetId: "extended",
      }),
    });

    const wrapper = mountPlanedoro();
    await nextTick();
    const timerText = wrapper.text();

    expect(timerText).toContain("01");
    expect(timerText).toContain("30");
    expect(timerText).toContain("Start");
  });

  it("discards stale running sessions older than the restore window", async () => {
    setLocalStorageValues({
      "planedoro.timerPresetId": "extended",
      "planedoro.timerSession": JSON.stringify({
        isRunning: true,
        pausedMsLeft: 120_000,
        savedAtMs: Date.now() - 3 * 60_000,
        workState: true,
        presetId: "extended",
      }),
    });

    const wrapper = mountPlanedoro();
    await nextTick();

    expect(wrapper.text()).toContain("50");
    expect(wrapper.text()).toContain("00");
    expect(window.localStorage.getItem("planedoro.timerSession")).toBeNull();
  });

  it("restores paused sessions within the 48-hour ttl", async () => {
    setLocalStorageValues({
      "planedoro.timerPresetId": "classic",
      "planedoro.timerSession": JSON.stringify({
        isRunning: false,
        pausedMsLeft: 95_000,
        savedAtMs: Date.now() - 10 * 60_000,
        workState: false,
        presetId: "classic",
      }),
    });

    const wrapper = mountPlanedoro();
    await nextTick();

    expect(wrapper.text()).toContain("01");
    expect(wrapper.text()).toContain("35");
    expect(wrapper.text()).toContain("Start");
  });

  it("discards paused sessions older than the 48-hour ttl", async () => {
    setLocalStorageValues({
      "planedoro.timerPresetId": "classic",
      "planedoro.timerSession": JSON.stringify({
        isRunning: false,
        pausedMsLeft: 95_000,
        savedAtMs: Date.now() - 49 * 60 * 60_000,
        workState: false,
        presetId: "classic",
      }),
    });

    const wrapper = mountPlanedoro();
    await nextTick();

    expect(wrapper.text()).toContain("25");
    expect(wrapper.text()).toContain("00");
    expect(window.localStorage.getItem("planedoro.timerSession")).toBeNull();
  });

  it("ignores saved sessions when the preset does not match", async () => {
    setLocalStorageValues({
      "planedoro.timerPresetId": "classic",
      "planedoro.timerSession": JSON.stringify({
        isRunning: false,
        pausedMsLeft: 95_000,
        savedAtMs: Date.now() - 10 * 60_000,
        workState: false,
        presetId: "extended",
      }),
    });

    const wrapper = mountPlanedoro();
    await nextTick();

    expect(wrapper.text()).toContain("25");
    expect(wrapper.text()).toContain("00");
  });
});
