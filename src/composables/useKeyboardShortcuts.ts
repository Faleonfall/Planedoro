import { onMounted, onBeforeUnmount } from "vue";

export function useKeyboardShortcuts(
  toggle: () => void,
  reset: () => void,
  setTogglePressed?: (pressed: boolean) => void,
  setResetPressed?: (pressed: boolean) => void,
  shouldIgnore?: () => boolean,
) {
  let toggleKeyActive = false;
  let resetKeyActive = false;

  function isEditableTarget(target: EventTarget | null): target is HTMLElement {
    if (!(target instanceof HTMLElement)) return false;

    const tag = target.tagName;
    return (
      tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
    );
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isEditableTarget(e.target)) return;

    if (e.code === "Space" || e.key === " ") {
      if (resetKeyActive) return;
      if (shouldIgnore?.()) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      toggleKeyActive = true;
      setTogglePressed?.(true);
    }
    if (e.key === "r" || e.key === "R") {
      if (toggleKeyActive) return;
      if (shouldIgnore?.()) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      resetKeyActive = true;
      setResetPressed?.(true);
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isEditableTarget(e.target)) return;

    if (e.code === "Space" || e.key === " ") {
      if (!toggleKeyActive) {
        if (shouldIgnore?.()) {
          e.preventDefault();
        }
        return;
      }
      e.preventDefault();
      toggleKeyActive = false;
      setTogglePressed?.(false);
      toggle();
    }

    if (e.key === "r" || e.key === "R") {
      if (!resetKeyActive) {
        if (shouldIgnore?.()) {
          e.preventDefault();
        }
        return;
      }
      e.preventDefault();
      resetKeyActive = false;
      setResetPressed?.(false);
      reset();
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  });
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  });
}
