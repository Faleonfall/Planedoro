import type { Ref } from "vue";

const CHIME_FADE_OUT_MS = 50;

type UseChimeAudioOptions = {
  audioEl: Ref<HTMLAudioElement | null>;
  isEnabled: Ref<boolean>;
};

export function useChimeAudio({ audioEl, isEnabled }: UseChimeAudioOptions) {
  function playChime() {
    if (!isEnabled.value) return;

    const audio = audioEl.value;
    if (!audio) return;

    audio.volume = 1;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function stopChime() {
    const audio = audioEl.value;
    if (!audio) return;

    if (audio.paused || audio.ended) {
      audio.currentTime = 0;
      audio.volume = 1;
      return;
    }

    const startVolume = audio.volume;
    const fadeStartedAt = performance.now();

    const fadeOut = () => {
      const elapsed = performance.now() - fadeStartedAt;
      const progress = Math.min(elapsed / CHIME_FADE_OUT_MS, 1);
      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(fadeOut);
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
    };

    requestAnimationFrame(fadeOut);
  }

  return {
    playChime,
    stopChime,
  };
}
