import { onMounted, onBeforeUnmount } from "vue";

export function useKeyboardShortcuts(toggle: () => void, reset: () => void) {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable)
      return;

    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "r" || e.key === "R") {
      reset();
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
}
