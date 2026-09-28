import { onMounted, onUnmounted, ref, type Ref } from "vue";

const NARROW_QUERY = "(max-width: 640px)";

export function useNarrowViewport(): Ref<boolean> {
  const isNarrow = ref(currentMatch());
  let media: MediaQueryList | null = null;

  function onChange(event: MediaQueryListEvent): void {
    isNarrow.value = event.matches;
  }

  onMounted(() => {
    media = getMedia();
    if (media === null) {
      return;
    }
    isNarrow.value = media.matches;
    media.addEventListener("change", onChange);
  });

  onUnmounted(() => {
    media?.removeEventListener("change", onChange);
  });

  return isNarrow;
}

function currentMatch(): boolean {
  return getMedia()?.matches ?? false;
}

function getMedia(): MediaQueryList | null {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }
  return window.matchMedia(NARROW_QUERY);
}
