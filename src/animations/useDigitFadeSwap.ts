import { nextTick, ref, watch, type Ref } from "vue";
import { gsap } from "gsap";

type FadeSwapOptions = {
  minutesEl: Ref<HTMLElement | null>;
  secondsEl: Ref<HTMLElement | null>;
  formattedMinutes: Ref<string>;
  formattedSeconds: Ref<string>;
  resetKey: Ref<number | string>;
  dur?: number;
  ease?: string; // default: "power1.out"
};

export function useDigitFadeSwap(opts: FadeSwapOptions) {
  const {
    minutesEl,
    secondsEl,
    formattedMinutes,
    formattedSeconds,
    resetKey,
    dur = 0.15,
    ease = "power1.out",
  } = opts;

  const shownMinutes = ref(formattedMinutes.value);
  const shownSeconds = ref(formattedSeconds.value);
  let suppressAnimation = false;

  function fadeSwap(el: HTMLElement | null, applyText: () => void) {
    if (!el) {
      applyText();
      return;
    }

    gsap.killTweensOf(el);

    gsap.to(el, {
      opacity: 0,
      duration: dur,
      ease,
      overwrite: true,
      onComplete: () => {
        applyText();
        gsap.to(el, {
          opacity: 1,
          duration: dur,
          ease,
          overwrite: true,
        });
      },
    });
  }

  function syncNow() {
    suppressAnimation = true;
    shownMinutes.value = formattedMinutes.value;
    shownSeconds.value = formattedSeconds.value;

    nextTick(() => {
      suppressAnimation = false;
    });
  }

  // Tick updates
  watch(formattedMinutes, (v) => {
    if (v === shownMinutes.value) return;

    if (suppressAnimation) {
      shownMinutes.value = v;
      return;
    }

    fadeSwap(minutesEl.value, () => {
      shownMinutes.value = v;
    });
  });

  watch(formattedSeconds, (v) => {
    if (v === shownSeconds.value) return;

    if (suppressAnimation) {
      shownSeconds.value = v;
      return;
    }

    fadeSwap(secondsEl.value, () => {
      shownSeconds.value = v;
    });
  });

  // Reset should also animate
  watch(resetKey, async () => {
    await nextTick();

    if (suppressAnimation) {
      shownMinutes.value = formattedMinutes.value;
      shownSeconds.value = formattedSeconds.value;
      return;
    }

    fadeSwap(minutesEl.value, () => {
      shownMinutes.value = formattedMinutes.value;
    });

    fadeSwap(secondsEl.value, () => {
      shownSeconds.value = formattedSeconds.value;
    });
  });

  return { shownMinutes, shownSeconds, syncNow };
}
