import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TimerControls from "../../src/components/TimerControls.vue";

function mountControls(props?: Partial<InstanceType<typeof TimerControls>["$props"]>) {
  return mount(TimerControls, {
    props: {
      isRunning: false,
      togglePressed: false,
      resetPressed: false,
      interactionLocked: false,
      ...props,
    },
  });
}

describe("TimerControls", () => {
  it("blocks click emits when interaction is locked", async () => {
    const wrapper = mountControls({ interactionLocked: true });
    const buttons = wrapper.findAll("button");

    await buttons[0].trigger("click");
    await buttons[1].trigger("click");

    expect(wrapper.emitted("toggle")).toBeUndefined();
    expect(wrapper.emitted("reset")).toBeUndefined();
  });

  it("applies the pressed class to either button independently", () => {
    const wrapper = mountControls({
      togglePressed: true,
      resetPressed: false,
    });

    const buttons = wrapper.findAll("button");
    expect(buttons[0].classes()).toContain("timer-controls__button--pressed");
    expect(buttons[1].classes()).not.toContain("timer-controls__button--pressed");

    wrapper.unmount();

    const secondWrapper = mountControls({
      togglePressed: false,
      resetPressed: true,
    });

    const secondButtons = secondWrapper.findAll("button");
    expect(secondButtons[0].classes()).not.toContain("timer-controls__button--pressed");
    expect(secondButtons[1].classes()).toContain("timer-controls__button--pressed");
  });
});
