import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "../../src/composables/useKeyboardShortcuts";

function dispatchKey(type: "keydown" | "keyup", target: Window | HTMLElement, init: KeyboardEventInit) {
  const event = new KeyboardEvent(type, {
    bubbles: true,
    ...init,
  });

  target.dispatchEvent(event);
}

function mountKeyboardHarness(options?: { shouldIgnore?: () => boolean }) {
  const toggle = vi.fn();
  const reset = vi.fn();
  const setTogglePressed = vi.fn();
  const setResetPressed = vi.fn();

  const wrapper = mount(
    defineComponent({
      setup() {
        useKeyboardShortcuts(
          toggle,
          reset,
          setTogglePressed,
          setResetPressed,
          options?.shouldIgnore,
        );
        return () => h("div");
      },
    }),
  );

  return { wrapper, toggle, reset, setTogglePressed, setResetPressed };
}

describe("useKeyboardShortcuts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("toggles on Space keyup, not keydown", () => {
    const { wrapper, toggle, reset, setTogglePressed } = mountKeyboardHarness();

    dispatchKey("keydown", document.body, {
      key: " ",
      code: "Space",
    });

    expect(toggle).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    expect(setTogglePressed).toHaveBeenLastCalledWith(true);

    dispatchKey("keyup", document.body, {
      key: " ",
      code: "Space",
    });

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(setTogglePressed).toHaveBeenLastCalledWith(false);
    wrapper.unmount();
  });

  it("resets on R keyup, not keydown", () => {
    const { wrapper, toggle, reset, setResetPressed } = mountKeyboardHarness();

    dispatchKey("keydown", document.body, {
      key: "r",
    });

    expect(reset).not.toHaveBeenCalled();
    expect(toggle).not.toHaveBeenCalled();
    expect(setResetPressed).toHaveBeenLastCalledWith(true);

    dispatchKey("keyup", document.body, {
      key: "r",
    });

    expect(reset).toHaveBeenCalledTimes(1);
    expect(setResetPressed).toHaveBeenLastCalledWith(false);
    wrapper.unmount();
  });

  it("does nothing on keyup if Space was blocked on keydown", () => {
    const { wrapper, toggle, reset, setTogglePressed } = mountKeyboardHarness({
      shouldIgnore: () => true,
    });

    dispatchKey("keydown", document.body, {
      key: " ",
      code: "Space",
    });
    dispatchKey("keyup", document.body, {
      key: " ",
      code: "Space",
    });

    expect(toggle).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    expect(setTogglePressed).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("does not allow R to start while Space is held", () => {
    const { wrapper, toggle, reset, setTogglePressed, setResetPressed } =
      mountKeyboardHarness();

    dispatchKey("keydown", document.body, {
      key: " ",
      code: "Space",
    });
    dispatchKey("keydown", document.body, {
      key: "r",
    });
    dispatchKey("keyup", document.body, {
      key: "r",
    });

    expect(setTogglePressed).toHaveBeenCalledWith(true);
    expect(setResetPressed).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();

    dispatchKey("keyup", document.body, {
      key: " ",
      code: "Space",
    });

    expect(toggle).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it("does not allow Space to start while R is held", () => {
    const { wrapper, toggle, reset, setTogglePressed, setResetPressed } =
      mountKeyboardHarness();

    dispatchKey("keydown", document.body, {
      key: "r",
    });
    dispatchKey("keydown", document.body, {
      key: " ",
      code: "Space",
    });
    dispatchKey("keyup", document.body, {
      key: " ",
      code: "Space",
    });

    expect(setResetPressed).toHaveBeenCalledWith(true);
    expect(setTogglePressed).not.toHaveBeenCalled();
    expect(toggle).not.toHaveBeenCalled();

    dispatchKey("keyup", document.body, {
      key: "r",
    });

    expect(reset).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it("blocks key starts while ignored but still cleans up an accepted key", () => {
    let shouldIgnore = false;
    const { wrapper, toggle, setTogglePressed } = mountKeyboardHarness({
      shouldIgnore: () => shouldIgnore,
    });

    dispatchKey("keydown", document.body, {
      key: " ",
      code: "Space",
    });

    shouldIgnore = true;

    dispatchKey("keyup", document.body, {
      key: " ",
      code: "Space",
    });

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(setTogglePressed).toHaveBeenCalledTimes(2);
    expect(setTogglePressed).toHaveBeenNthCalledWith(1, true);
    expect(setTogglePressed).toHaveBeenNthCalledWith(2, false);
    wrapper.unmount();
  });

  it("ignores repeated, modified, and editable-target key presses", () => {
    const { wrapper, toggle, reset } = mountKeyboardHarness();

    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    Object.defineProperty(editable, "isContentEditable", {
      configurable: true,
      value: true,
    });

    document.body.append(input, textarea, editable);

    dispatchKey("keydown", document.body, {
      key: " ",
      code: "Space",
      repeat: true,
    });
    dispatchKey("keydown", document.body, {
      key: "r",
      metaKey: true,
    });
    dispatchKey("keydown", document.body, {
      key: "r",
      ctrlKey: true,
    });
    dispatchKey("keydown", document.body, {
      key: "r",
      altKey: true,
    });
    dispatchKey("keydown", input, {
      key: " ",
      code: "Space",
    });
    dispatchKey("keydown", textarea, {
      key: "r",
    });
    dispatchKey("keydown", editable, {
      key: "r",
    });

    expect(toggle).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
