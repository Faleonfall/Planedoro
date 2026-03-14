import { nextTick } from "vue";
import { beforeEach, describe, expect, it } from "vitest";
import { useTimerPreferences } from "../../src/composables/useTimerPreferences";

function createStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

describe("useTimerPreferences", () => {
  const localStorage = createStorageMock();

  beforeEach(() => {
    localStorage.clear();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage },
    });
  });

  it("loads saved chime and preset preferences", () => {
    localStorage.setItem("planedoro.chimeEnabled", "false");
    localStorage.setItem("planedoro.timerPresetId", "flexible");

    const { chimeEnabled, timerPresetIndex } = useTimerPreferences();

    expect(chimeEnabled.value).toBe(false);
    expect(timerPresetIndex.value).toBe(2);
  });

  it("uses app defaults when no preferences are stored", () => {
    const { chimeEnabled, timerPresetIndex } = useTimerPreferences();

    expect(chimeEnabled.value).toBe(true);
    expect(timerPresetIndex.value).toBe(0);
  });

  it("treats non-boolean chime JSON as disabled and unknown presets as default", () => {
    localStorage.setItem("planedoro.chimeEnabled", "\"maybe\"");
    localStorage.setItem("planedoro.timerPresetId", "unknown");

    const { chimeEnabled, timerPresetIndex } = useTimerPreferences();

    expect(chimeEnabled.value).toBe(false);
    expect(timerPresetIndex.value).toBe(0);
  });

  it("falls back safely when stored chime JSON is malformed", () => {
    localStorage.setItem("planedoro.chimeEnabled", "{bad-json");
    localStorage.setItem("planedoro.timerPresetId", "classic");

    const { chimeEnabled, timerPresetIndex } = useTimerPreferences();

    expect(chimeEnabled.value).toBe(true);
    expect(timerPresetIndex.value).toBe(1);
  });

  it("persists updated preferences", async () => {
    const { chimeEnabled, timerPresetIndex } = useTimerPreferences();

    chimeEnabled.value = false;
    timerPresetIndex.value = 1;

    await nextTick();

    expect(localStorage.getItem("planedoro.chimeEnabled")).toBe("false");
    expect(localStorage.getItem("planedoro.timerPresetId")).toBe("classic");
  });
});
