import { ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimer } from "../../src/composables/useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hydrates paused state correctly", () => {
    const timer = useTimer({
      workMinutes: ref(50),
      breakMinutes: ref(10),
    });

    timer.hydrate({
      pausedMsLeft: 125_000,
      workState: false,
    });

    expect(timer.isRunning.value).toBe(false);
    expect(timer.workState.value).toBe(false);
    expect(timer.timeLeft.value).toBe(125);
    expect(timer.formattedMinutes.value).toBe("02");
    expect(timer.formattedSeconds.value).toBe("05");
  });

  it("reset restores the full work duration", () => {
    const timer = useTimer({
      workMinutes: ref(50),
      breakMinutes: ref(10),
    });

    timer.hydrate({
      pausedMsLeft: 17_000,
      workState: false,
    });

    timer.reset();

    expect(timer.isRunning.value).toBe(false);
    expect(timer.workState.value).toBe(true);
    expect(timer.timeLeft.value).toBe(3_000);
    expect(timer.formattedMinutes.value).toBe("50");
    expect(timer.formattedSeconds.value).toBe("00");
  });

  it("snapshot after reset while paused reflects the full work duration", () => {
    const timer = useTimer({
      workMinutes: ref(50),
      breakMinutes: ref(10),
    });

    timer.hydrate({
      pausedMsLeft: 17_000,
      workState: false,
    });

    timer.reset();

    expect(timer.getSnapshot()).toMatchObject({
      isRunning: false,
      workState: true,
      pausedMsLeft: 3_000_000,
    });
  });

  it("snapshot reflects a running timer with reduced remaining time", () => {
    const timer = useTimer({
      workMinutes: ref(1),
      breakMinutes: ref(1),
    });

    timer.toggle(() => {});
    vi.advanceTimersByTime(1_500);

    const snapshot = timer.getSnapshot();

    expect(snapshot.isRunning).toBe(true);
    expect(snapshot.workState).toBe(true);
    expect(snapshot.pausedMsLeft).toBeGreaterThan(58_000);
    expect(snapshot.pausedMsLeft).toBeLessThan(60_000);
  });

  it("switches from work to break when the phase completes", () => {
    const timer = useTimer({
      workMinutes: ref(1 / 60),
      breakMinutes: ref(2 / 60),
    });

    timer.toggle(() => {});
    vi.advanceTimersByTime(1_100);

    expect(timer.workState.value).toBe(false);
    expect(timer.timeLeft.value).toBe(2);
    expect(timer.formattedMinutes.value).toBe("00");
    expect(timer.formattedSeconds.value).toBe("02");
  });

  it("hydrates zero remaining time without restarting", () => {
    const timer = useTimer({
      workMinutes: ref(50),
      breakMinutes: ref(10),
    });

    timer.hydrate({
      pausedMsLeft: 0,
      workState: true,
    });

    expect(timer.isRunning.value).toBe(false);
    expect(timer.timeLeft.value).toBe(0);
    expect(timer.formattedMinutes.value).toBe("00");
    expect(timer.formattedSeconds.value).toBe("00");
  });

  it("rolls over cleanly from the last second into the next phase", () => {
    const timer = useTimer({
      workMinutes: ref(50),
      breakMinutes: ref(2 / 60),
    });

    timer.hydrate({
      pausedMsLeft: 1_000,
      workState: true,
    });

    timer.toggle(() => {});
    vi.advanceTimersByTime(1_050);

    expect(timer.isRunning.value).toBe(true);
    expect(timer.workState.value).toBe(false);
    expect(timer.timeLeft.value).toBe(2);
  });

  it("stops with a reduced remaining snapshot after some elapsed time", () => {
    const timer = useTimer({
      workMinutes: ref(1),
      breakMinutes: ref(1),
    });

    timer.toggle(() => {});
    vi.advanceTimersByTime(12_300);
    timer.toggle(() => {});

    const snapshot = timer.getSnapshot();

    expect(snapshot.isRunning).toBe(false);
    expect(snapshot.workState).toBe(true);
    expect(snapshot.pausedMsLeft).toBeGreaterThan(47_000);
    expect(snapshot.pausedMsLeft).toBeLessThan(48_000);
  });
});
