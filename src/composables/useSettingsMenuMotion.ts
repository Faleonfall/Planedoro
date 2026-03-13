import { nextTick, onBeforeUnmount, ref, watch, type Ref } from "vue";
import { gsap } from "gsap";

type UseSettingsMenuMotionOptions = {
  chimeEnabled: Ref<boolean>;
  menuRootEl: Ref<HTMLElement | null>;
  popupEl: Ref<HTMLElement | null>;
  soundValueEl: Ref<HTMLElement | null>;
};

export function useSettingsMenuMotion({
  chimeEnabled,
  menuRootEl,
  popupEl,
  soundValueEl,
}: UseSettingsMenuMotionOptions) {
  const show = ref(false);
  const isRendered = ref(false);
  const soundValue = ref(chimeEnabled.value ? "enabled" : "disabled");

  function showPopup() {
    if (!isRendered.value) {
      isRendered.value = true;
    }

    show.value = true;
  }

  function hidePopup() {
    show.value = false;
  }

  function togglePopup() {
    if (show.value) {
      hidePopup();
      return;
    }

    showPopup();
  }

  function handlePointerDown(event: PointerEvent) {
    if (!show.value) return;

    const root = menuRootEl.value;
    const target = event.target;

    if (!root || !(target instanceof Node)) return;
    if (root.contains(target)) return;

    hidePopup();
  }

  watch(show, async (value) => {
    await nextTick();

    const popup = popupEl.value;
    if (!popup) return;

    gsap.killTweensOf(popup);

    if (value) {
      gsap.set(popup, {
        opacity: 0,
        y: -10,
        scale: 0.96,
        filter: "blur(4px)",
        transformOrigin: "top right",
      });

      gsap.to(popup, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.2,
        ease: "power2.out",
      });

      popup.focus();
      return;
    }

    gsap.to(popup, {
      opacity: 0,
      y: -8,
      scale: 0.98,
      filter: "blur(4px)",
      duration: 0.15,
      ease: "power1.in",
      onComplete: () => {
        isRendered.value = false;
      },
    });
  });

  watch(chimeEnabled, (enabled) => {
    const nextValue = enabled ? "enabled" : "disabled";
    const valueEl = soundValueEl.value;
    const exitToX = enabled ? 8 : -8;
    const enterFromX = enabled ? -8 : 8;

    if (!valueEl) {
      soundValue.value = nextValue;
      return;
    }

    gsap.killTweensOf(valueEl);

    gsap.to(valueEl, {
      opacity: 0,
      x: exitToX,
      filter: "blur(1px)",
      duration: 0.12,
      ease: "power1.in",
      onComplete: () => {
        soundValue.value = nextValue;

        gsap.fromTo(
          valueEl,
          {
            opacity: 0,
            x: enterFromX,
            filter: "blur(1px)",
          },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.18,
            ease: "power2.out",
          },
        );
      },
    });
  });

  window.addEventListener("pointerdown", handlePointerDown);

  onBeforeUnmount(() => {
    window.removeEventListener("pointerdown", handlePointerDown);

    if (popupEl.value) {
      gsap.killTweensOf(popupEl.value);
    }

    if (soundValueEl.value) {
      gsap.killTweensOf(soundValueEl.value);
    }
  });

  return {
    hidePopup,
    isRendered,
    show,
    soundValue,
    togglePopup,
  };
}
