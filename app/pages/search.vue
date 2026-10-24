<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDebounce } from "@/composables/useDebounce";
import {
  ImageOff,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const route = useRoute();
const router = useRouter();

const q = ref(String(route.query.q ?? ""));
const orientation = ref(String(route.query.orientation ?? ""));
const sort = ref(route.query.sort === "oldest" ? "oldest" : "latest");

const { debouncedValue } = useDebounce(q, 300);

const orientations = [
  { value: "", label: "All" },
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
  { value: "square", label: "Square" },
];

watch([debouncedValue, orientation, sort], () => {
  const query: Record<string, string> = {};
  const term = debouncedValue.value.trim();
  if (term) query.q = term;
  if (orientation.value) query.orientation = orientation.value;
  if (sort.value === "oldest") query.sort = "oldest";

  router.replace({ path: "/search", query });
});

const filters = computed(() => ({
  q: debouncedValue.value.trim() || undefined,
  orientation: orientation.value || undefined,
  sort: sort.value,
}));

const {
  photos,
  status,
  error,
  nextCursor,
  loadingMore,
  loadMoreError,
  loadMore,
} = await usePhotoFeed(filters);

const heading = computed(() =>
  filters.value.q ? `Results for “${filters.value.q}”` : "Browse every photo"
);
const hasFilters = computed(
  () => Boolean(filters.value.q) || Boolean(filters.value.orientation)
);
const isInitialLoading = computed(
  () => status.value === "pending" && photos.value.length === 0
);

function clearFilters() {
  q.value = "";
  orientation.value = "";
  sort.value = "latest";
}

useSeoMeta({
  title: computed(() =>
    filters.value.q
      ? `${filters.value.q} — Photo search — Fotostash`
      : "Photo search — Fotostash"
  ),
  description:
    "Search free photos by keyword, orientation and upload date on Fotostash.",
  robots: "noindex, follow",
});
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
    <header class="max-w-2xl">
      <p
        class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
      >
        Discover
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
        Find your next image
      </h1>
      <p class="mt-2 text-sm text-muted-foreground md:text-base">
        Search by subject, then narrow by orientation or freshness. Every photo
        is free to download and share.
      </p>
    </header>

    <div class="mt-8 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
      <div class="relative">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="q"
          type="search"
          placeholder="Try “sunset”, “mountains” or “portrait”"
          class="h-11 pl-9 pr-10 text-base"
          aria-label="Search photos"
        />
        <button
          v-if="q"
          type="button"
          class="absolute right-2 top-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
          @click="q = ''"
        >
          <X class="size-4" />
        </button>
      </div>

      <div
        class="mt-3 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex flex-wrap items-center gap-1" role="group" aria-label="Orientation">
          <span class="mr-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal class="size-3.5" />
            Orientation
          </span>
          <button
            v-for="option in orientations"
            :key="option.value || 'all'"
            type="button"
            class="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            :class="
              orientation === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            "
            :aria-pressed="orientation === option.value"
            @click="orientation = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <label class="flex items-center gap-2 text-xs text-muted-foreground">
          Sort
          <select
            v-model="sort"
            class="h-8 rounded-md border bg-background px-2 text-xs font-medium text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="latest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>
    </div>

    <div class="mt-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">{{ heading }}</h2>
        <p class="mt-0.5 text-sm text-muted-foreground">
          {{ photos.length }} {{ photos.length === 1 ? "photo" : "photos" }}
          <template v-if="hasFilters"> matched your filters</template>
        </p>
      </div>
      <Button
        v-if="hasFilters"
        variant="ghost"
        size="sm"
        class="text-muted-foreground"
        @click="clearFilters"
      >
        <X class="size-4" />
        Clear filters
      </Button>
    </div>

    <MasonryLoadingComp v-if="isInitialLoading" />

    <MasonryComp v-else-if="photos.length" :items="photos" :duration="0.5" />

    <div
      v-else-if="status === 'success'"
      class="mx-auto max-w-md py-16 text-center"
    >
      <div
        class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/40"
      >
        <ImageOff class="size-6 text-muted-foreground" />
      </div>
      <h2 class="text-lg font-semibold">No photos found</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Try a different keyword or remove a filter.
      </p>
      <Button v-if="hasFilters" variant="outline" class="mt-5" @click="clearFilters">
        Clear filters
      </Button>
    </div>

    <p
      v-if="error"
      class="mx-auto max-w-md py-16 text-center text-sm text-destructive"
    >
      {{ error.message || "Could not load photos." }}
    </p>

    <div v-if="nextCursor" class="mt-4 flex flex-col items-center gap-2 pb-6">
      <Button variant="outline" :disabled="loadingMore" @click="loadMore">
        <Loader2 v-if="loadingMore" class="animate-spin" />
        {{ loadingMore ? "Loading photos…" : "Load more photos" }}
      </Button>
      <p v-if="loadMoreError" class="text-xs text-destructive">
        {{ loadMoreError }}
      </p>
    </div>
  </div>
</template>
