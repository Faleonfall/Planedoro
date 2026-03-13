import { ref, computed, onBeforeUnmount, type Ref } from "vue";
import * as timerConfig from "../config/timerConfig";

type UseTimerOptions = {
  workMinutes?: Ref<number>;
  breakMinutes?: Ref<number>;
};

export function useTimer(options: UseTimerOptions = {}) {
  const workMinutes = options.workMinutes ?? ref(timerConfig.WORK_MINUTES);
  const breakMinutes = options.breakMinutes ?? ref(timerConfig.BREAK_MINUTES);
  const isRunning = ref(false);
  const workState = ref(true); // true = work, false = break
  const timeLeft = ref(workMinutes.value * 60); // seconds (display)

  const resetKey = ref(0);

  // Drift-proof core: an absolute end timestamp (ms since epoch)
  let endTimestampMs = 0;
  let pausedMsLeft = workMinutes.value * 60 * 1000;

  // Chime scheduling
  let chimeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Display update scheduling (boundary-aligned)
  let tickTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Guards against "ghost" timeouts after stop/restart
  let runToken = 0;

  const formattedMinutes = computed(() =>
    String(Math.floor(timeLeft.value / 60)).padStart(2, "0"),
  );
  const formattedSeconds = computed(() =>
    String(timeLeft.value % 60).padStart(2, "0"),
  );

  function clearChimeTimeout() {
    if (chimeTimeoutId) {
      clearTimeout(chimeTimeoutId);
      chimeTimeoutId = null;
    }
  }

  function clearTickTimeout() {
    if (tickTimeoutId) {
      clearTimeout(tickTimeoutId);
      tickTimeoutId = null;
    }
  }

  function scheduleChime(playChime: () => void) {
    clearChimeTimeout();

    const myToken = runToken;

    // Keep the same offset behavior as before:
    // when "3" is shown, chime after CHIME_OFFSET_MS.
    const chimeTargetMsBeforeEnd = 3000 - timerConfig.CHIME_OFFSET_MS;
    const chimeAtMs = endTimestampMs - chimeTargetMsBeforeEnd;
    const delay = chimeAtMs - Date.now();

    if (delay > 0) {
      chimeTimeoutId = setTimeout(() => {
        chimeTimeoutId = null;

        // Prevent "played for no reason" after stop/restart
        if (!isRunning.value) return;
        if (runToken !== myToken) return;

        playChime();
      }, delay);
    }
  }

  function phaseDurationSeconds() {
    return (workState.value ? workMinutes.value : breakMinutes.value) * 60;
  }

  function setPhase(seconds: number, playChime?: () => void) {
    endTimestampMs = Date.now() + seconds * 1000;
    pausedMsLeft = seconds * 1000;
    timeLeft.value = seconds;

    if (isRunning.value && playChime && seconds >= 3) {
      scheduleChime(playChime);
    }
  }

  function loop(playChime: () => void) {
    const msLeft = endTimestampMs - Date.now();

    if (msLeft <= 0) {
      workState.value = !workState.value;
      const next = phaseDurationSeconds();
      setPhase(next, playChime);
      tickTimeoutId = setTimeout(() => loop(playChime), 0);
      return;
    }

    const nextSeconds = Math.max(0, Math.ceil(msLeft / 1000));

    // If we're already below 3 seconds, don't let a previously scheduled chime fire
    if (nextSeconds < 3) {
      clearChimeTimeout();
    }

    // Only update when the displayed second actually changes
    if (nextSeconds !== timeLeft.value) {
      timeLeft.value = nextSeconds;
    }

    // Schedule exactly for the next second boundary
    const boundaryMs = (nextSeconds - 1) * 1000;
    const delay = Math.max(10, msLeft - boundaryMs + 5);

    tickTimeoutId = setTimeout(() => loop(playChime), delay);
  }

  function startTimer(playChime: () => void) {
    runToken++;
    clearTickTimeout();
    clearChimeTimeout();

    isRunning.value = true;
    endTimestampMs = Date.now() + pausedMsLeft;

    if (pausedMsLeft >= 3000) {
      scheduleChime(playChime);
    }

    // Start boundary-aligned loop
    loop(playChime);
  }

  function stopTimer() {
    runToken++;
    isRunning.value = false;

    clearTickTimeout();
    clearChimeTimeout();

    // Freeze display accurately at stop time
    if (endTimestampMs) {
      const msLeft = Math.max(0, endTimestampMs - Date.now());
      pausedMsLeft = msLeft;
      timeLeft.value = Math.max(0, Math.ceil(msLeft / 1000));
    }
  }

  function toggle(playChime: () => void) {
    if (isRunning.value) stopTimer();
    else startTimer(playChime);
  }

  function reset() {
    runToken++;
    stopTimer();
    workState.value = true;
    endTimestampMs = 0;
    pausedMsLeft = workMinutes.value * 60 * 1000;
    timeLeft.value = workMinutes.value * 60;
    resetKey.value++;
  }

  onBeforeUnmount(() => {
    stopTimer();
  });

  return {
    isRunning,
    workState,
    timeLeft,
    resetKey,
    formattedMinutes,
    formattedSeconds,
    toggle,
    reset,
  };
}
