import { ref, watch } from "vue";

/**
 * Debounce a ref value and get a debounced value and pending state.
 * @param value Source ref to debounce
 * @param delay Debounce time in ms
 * @returns { debouncedValue, pending }
 */
export function useDebounce<T>(value: Ref<T>, delay = 500) {
  const debouncedValue = ref(value.value) as Ref<T>;
  const pending = ref(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  watch(
    value,
    (newVal) => {
      pending.value = true;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        debouncedValue.value = newVal;
        pending.value = false;
      }, delay);
    },
    { immediate: true }
  );

  return { debouncedValue, pending };
}
