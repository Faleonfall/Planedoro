import { ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChimeAudio } from "../../src/composables/useChimeAudio";

type AudioStub = {
  currentTime: number;
  ended: boolean;
  pause: ReturnType<typeof vi.fn>;
  paused: boolean;
  play: ReturnType<typeof vi.fn>;
  volume: number;
};

function createAudioStub(): AudioStub {
  return {
    currentTime: 12,
    ended: false,
    pause: vi.fn(),
    paused: false,
    play: vi.fn().mockResolvedValue(undefined),
    volume: 0.4,
  };
}

describe("useChimeAudio", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not play when disabled", () => {
    const audioEl = ref<AudioStub | null>(createAudioStub());
    const isEnabled = ref(false);
    const { playChime } = useChimeAudio({
      audioEl: audioEl as never,
      isEnabled,
    });

    playChime();

    expect(audioEl.value?.play).not.toHaveBeenCalled();
  });

  it("resets current time and volume before playing", () => {
    const audioEl = ref<AudioStub | null>(createAudioStub());
    const isEnabled = ref(true);
    const { playChime } = useChimeAudio({
      audioEl: audioEl as never,
      isEnabled,
    });

    playChime();

    expect(audioEl.value?.volume).toBe(1);
    expect(audioEl.value?.currentTime).toBe(0);
    expect(audioEl.value?.play).toHaveBeenCalledTimes(1);
  });

  it("swallows play failures without throwing", async () => {
    const audio = createAudioStub();
    audio.play = vi.fn().mockRejectedValue(new Error("blocked"));

    const { playChime } = useChimeAudio({
      audioEl: ref(audio) as never,
      isEnabled: ref(true),
    });

    expect(() => playChime()).not.toThrow();
    await Promise.resolve();
    expect(audio.play).toHaveBeenCalledTimes(1);
  });

  it("immediately normalizes paused audio on stop", () => {
    const audio = createAudioStub();
    audio.paused = true;

    const { stopChime } = useChimeAudio({
      audioEl: ref(audio) as never,
      isEnabled: ref(true),
    });

    stopChime();

    expect(audio.currentTime).toBe(0);
    expect(audio.volume).toBe(1);
    expect(audio.pause).not.toHaveBeenCalled();
  });

  it("fades out active audio and then resets it", () => {
    const audio = createAudioStub();
    audio.volume = 0.8;

    const { stopChime } = useChimeAudio({
      audioEl: ref(audio) as never,
      isEnabled: ref(true),
    });

    stopChime();
    vi.advanceTimersByTime(80);

    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    expect(audio.volume).toBe(1);
  });
});
