import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTimerSession,
  readTimerSession,
  writeTimerSession,
} from "../../src/composables/useTimerSessionStorage";

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

describe("useTimerSessionStorage", () => {
  const localStorage = createStorageMock();

  beforeEach(() => {
    localStorage.clear();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage },
    });
  });

  it("writes and reads a valid timer session", () => {
    writeTimerSession(
      {
        isRunning: true,
        pausedMsLeft: 123_000,
        savedAtMs: 1_700_000_000_000,
        workState: false,
      },
      "classic",
    );

    expect(readTimerSession()).toEqual({
      isRunning: true,
      pausedMsLeft: 123_000,
      savedAtMs: 1_700_000_000_000,
      workState: false,
      presetId: "classic",
    });
  });

  it("returns null and clears malformed JSON", () => {
    localStorage.setItem("planedoro.timerSession", "{not-json");

    expect(readTimerSession()).toBeNull();
    expect(localStorage.getItem("planedoro.timerSession")).toBeNull();
  });

  it("returns null and clears invalid session shapes", () => {
    localStorage.setItem(
      "planedoro.timerSession",
      JSON.stringify({
        isRunning: "yes",
        pausedMsLeft: "12000",
        savedAtMs: null,
        workState: true,
        presetId: "classic",
      }),
    );

    expect(readTimerSession()).toBeNull();
    expect(localStorage.getItem("planedoro.timerSession")).toBeNull();
  });

  it("returns null and clears unknown preset ids", () => {
    localStorage.setItem(
      "planedoro.timerSession",
      JSON.stringify({
        isRunning: false,
        pausedMsLeft: 12_000,
        savedAtMs: 1_700_000_000_000,
        workState: true,
        presetId: "mystery",
      }),
    );

    expect(readTimerSession()).toBeNull();
    expect(localStorage.getItem("planedoro.timerSession")).toBeNull();
  });

  it("clears the stored timer session", () => {
    writeTimerSession(
      {
        isRunning: false,
        pausedMsLeft: 50_000,
        savedAtMs: 1_700_000_000_000,
        workState: true,
      },
      "extended",
    );

    clearTimerSession();

    expect(readTimerSession()).toBeNull();
  });
});
