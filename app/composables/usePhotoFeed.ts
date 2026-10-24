import type { Photo, PhotoFeedFilters, PhotoPage } from "@/types/photo";

/**
 * Paginated, filter-aware feed of approved photos.
 * The first page is rendered on the server; "load more" appends client-side.
 */
export async function usePhotoFeed(
  filters: Ref<PhotoFeedFilters>,
  endpoint = "/api/photo/get-all"
) {
  const query = computed(() => {
    const entries = Object.entries(filters.value).filter(
      ([, value]) => typeof value === "string" && value.length > 0
    );
    return Object.fromEntries(entries) as Record<string, string>;
  });

  const { data, status, error, refresh } = await useAsyncData<PhotoPage>(
    () => `${endpoint}:${JSON.stringify(query.value)}`,
    () => $fetch<PhotoPage>(endpoint, { query: query.value }),
    { watch: [query] }
  );

  const extra = ref<Photo[]>([]);
  const nextCursor = ref<string | null>(null);
  const loadingMore = ref(false);
  const loadMoreError = ref<string | null>(null);

  watch(
    data,
    (page) => {
      extra.value = [];
      nextCursor.value = page?.nextCursor ?? null;
      loadMoreError.value = null;
    },
    { immediate: true }
  );

  const photos = computed<Photo[]>(() => [
    ...(data.value?.items ?? []),
    ...extra.value,
  ]);

  async function loadMore() {
    if (!nextCursor.value || loadingMore.value) return;

    loadingMore.value = true;
    loadMoreError.value = null;

    try {
      const page = await $fetch<PhotoPage>(endpoint, {
        query: { ...query.value, cursor: nextCursor.value },
      });
      extra.value.push(...page.items);
      nextCursor.value = page.nextCursor;
    } catch (loadError) {
      loadMoreError.value =
        (loadError as Error).message || "Could not load more photos.";
    } finally {
      loadingMore.value = false;
    }
  }

  return {
    photos,
    status,
    error,
    refresh,
    nextCursor,
    loadingMore,
    loadMoreError,
    loadMore,
  };
}
