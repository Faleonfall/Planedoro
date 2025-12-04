import {onMounted, onBeforeUnmount} from "vue";

export function useKeyboardShortcuts(toggle: () => void, reset: () => void) {
    function handleKeyDown(e: KeyboardEvent) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

        if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            toggle();
        }
        if (e.key === "r" || e.key === "R") {
            reset();
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeyDown);
    });
    onBeforeUnmount(() => {
        window.removeEventListener('keydown', handleKeyDown);
    });
}
