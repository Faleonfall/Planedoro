import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "../../src/composables/useKeyboardShortcuts";

function mountKeyboardHarness(toggle: () => void, reset: () => void) {
  return mount(
    defineComponent({
      setup() {
        useKeyboardShortcuts(toggle, reset);
        return () => h("div");
      },
    }),
  );
}

describe("useKeyboardShortcuts", () => {
  function dispatchKeyDown(
    target: Window | HTMLElement,
    init: KeyboardEventInit,
  ) {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      ...init,
    });

    target.dispatchEvent(event);
  }

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("toggles on plain Space", () => {
    const toggle = vi.fn();
    const reset = vi.fn();
    const wrapper = mountKeyboardHarness(toggle, reset);

    dispatchKeyDown(document.body, {
      key: " ",
      code: "Space",
    });

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(reset).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("resets on plain R", () => {
    const toggle = vi.fn();
    const reset = vi.fn();
    const wrapper = mountKeyboardHarness(toggle, reset);

    dispatchKeyDown(document.body, {
      key: "r",
    });

    expect(reset).toHaveBeenCalledTimes(1);
    expect(toggle).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("ignores repeated and modified key presses", () => {
    const toggle = vi.fn();
    const reset = vi.fn();
    const wrapper = mountKeyboardHarness(toggle, reset);

    dispatchKeyDown(document.body, {
      key: " ",
      code: "Space",
      repeat: true,
    });
    dispatchKeyDown(document.body, {
      key: "r",
      metaKey: true,
    });
    dispatchKeyDown(document.body, {
      key: "r",
      ctrlKey: true,
    });
    dispatchKeyDown(document.body, {
      key: "r",
      altKey: true,
    });

    expect(toggle).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("ignores input, textarea, and contenteditable targets", () => {
    const toggle = vi.fn();
    const reset = vi.fn();
    const wrapper = mountKeyboardHarness(toggle, reset);

    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    Object.defineProperty(editable, "isContentEditable", {
      configurable: true,
      value: true,
    });

    document.body.append(input, textarea, editable);

    dispatchKeyDown(input, {
      key: " ",
      code: "Space",
    });
    dispatchKeyDown(textarea, {
      key: "r",
    });
    dispatchKeyDown(editable, {
      key: "r",
    });

    expect(toggle).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
