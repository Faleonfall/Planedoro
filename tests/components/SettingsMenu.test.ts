import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import SettingsMenu from "../../src/components/SettingsMenu.vue";

vi.mock("gsap", () => ({
  gsap: {
    killTweensOf: vi.fn(),
    set: vi.fn(),
    to: vi.fn((_: unknown, vars: { onComplete?: () => void }) => {
      vars.onComplete?.();
    }),
    fromTo: vi.fn((_: unknown, __: unknown, vars: { onComplete?: () => void }) => {
      vars.onComplete?.();
    }),
  },
}));

describe("SettingsMenu", () => {
  it("opens and closes the panel from the trigger", async () => {
    const wrapper = mount(SettingsMenu, {
      props: {
        chimeEnabled: true,
        timerPresetLabel: "50 min work / 10 min break",
      },
    });

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

    await wrapper.get('button[aria-label="Open settings"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.get('button[aria-label="Open settings"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("emits chime updates from the LED toggle", async () => {
    const wrapper = mount(SettingsMenu, {
      props: {
        chimeEnabled: true,
        timerPresetLabel: "50 min work / 10 min break",
      },
    });

    await wrapper.get('button[aria-label="Open settings"]').trigger("click");
    await wrapper.get('button[aria-label="Disable chime"]').trigger("click");

    expect(wrapper.emitted("update:chimeEnabled")).toEqual([[false]]);
  });

  it("emits preset cycling from the focus-cycle button", async () => {
    const wrapper = mount(SettingsMenu, {
      props: {
        chimeEnabled: true,
        timerPresetLabel: "50 min work / 10 min break",
      },
    });

    await wrapper.get('button[aria-label="Open settings"]').trigger("click");
    await wrapper
      .get('button[aria-label^="Switch focus cycle."]')
      .trigger("click");

    expect(wrapper.emitted("cycleTimerPreset")).toHaveLength(1);
  });

  it("closes when clicking outside the menu", async () => {
    const wrapper = mount(SettingsMenu, {
      attachTo: document.body,
      props: {
        chimeEnabled: true,
        timerPresetLabel: "50 min work / 10 min break",
      },
    });

    await wrapper.get('button[aria-label="Open settings"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );
    await wrapper.vm.$nextTick();
    await nextTick();
    await nextTick();

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
