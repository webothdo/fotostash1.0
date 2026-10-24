<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ImageOff, Loader2, Search } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "vue-sonner";

interface Photo {
  id: string;
  slug?: string | null;
  url: string;
  title?: string | null;
  height: number;
  width?: number | null;
  approved?: boolean | null;
  rejected?: boolean | null;
}

interface PhotoPage {
  items: Photo[];
  nextCursor: string | null;
}

const siteUrl = useSiteUrl();

const { data, status, error } = await useFetch<PhotoPage>(
  "/api/photo/get-all",
  { lazy: true }
);

const { data: popularTags } = await useFetch<
  { tag: string; count: number }[]
>("/api/tags", { query: { limit: 10 } });

const searchTerm = ref("");

function goSearch() {
  const term = searchTerm.value.trim();
  return navigateTo({
    path: "/search",
    query: term ? { q: term } : undefined,
  });
}

const photos = ref<Photo[]>(data.value?.items ?? []);
const nextCursor = ref<string | null>(data.value?.nextCursor ?? null);
const loadingMore = ref(false);

watch(data, (page) => {
  if (page && photos.value.length === 0) {
    photos.value = page.items;
    nextCursor.value = page.nextCursor;
  }
});

const hasPhotos = computed(() => photos.value.length > 0);

async function loadMore() {
  if (!nextCursor.value || loadingMore.value) return;

  loadingMore.value = true;

  try {
    const page = await $fetch<PhotoPage>("/api/photo/get-all", {
      query: { cursor: nextCursor.value },
    });
    photos.value.push(...page.items);
    nextCursor.value = page.nextCursor;
  } catch (loadError) {
    toast.error("Could not load more photos", {
      description: (loadError as Error).message,
    });
  } finally {
    loadingMore.value = false;
  }
}

useSeoMeta({
  title: "Fotostash — Image sharing without the limits",
  description:
    "Browse free photos shared by photographers on Fotostash. Discover, download, and share images without the limits.",
  ogTitle: "Fotostash — Image sharing without the limits",
  ogDescription:
    "Browse free photos shared by photographers on Fotostash. Discover, download, and share images without the limits.",
  ogType: "website",
  ogUrl: siteUrl,
  twitterCard: "summary_large_image",
});

useHead({
  link: [{ rel: "canonical", href: siteUrl }],
});
</script>

<template>
  <div class="mb-10">
    <HeaderComp />

    <section
      class="mx-auto mb-6 w-full max-w-5xl px-4"
      aria-label="Search photos"
    >
      <form
        class="flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center"
        @submit.prevent="goSearch"
      >
        <div class="relative flex-1">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            v-model="searchTerm"
            type="search"
            placeholder="Search free photos…"
            aria-label="Search free photos"
            class="h-10 border-transparent bg-muted/40 pl-9 shadow-none focus-visible:bg-background"
          />
        </div>
        <Button type="submit" class="h-10 px-5">Search</Button>
      </form>

      <div
        v-if="popularTags?.length"
        class="mt-3 flex flex-wrap items-center gap-2 text-xs"
      >
        <span class="text-muted-foreground">Popular:</span>
        <NuxtLink
          v-for="item in popularTags"
          :key="item.tag"
          :to="`/tag/${encodeURIComponent(item.tag)}`"
          class="rounded-full border bg-background px-3 py-1 font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
        >
          #{{ item.tag }}
        </NuxtLink>
      </div>
    </section>

    <MasonryLoadingComp v-if="status === 'pending' && !hasPhotos" />

    <MasonryComp
      v-if="hasPhotos"
      :items="photos"
      :duration="0.6"
      :stagger="0.05"
      animate-from="bottom"
      :scale-on-hover="true"
      :hover-scale="0.95"
      :blur-to-focus="true"
      :color-shift-on-hover="false"
    />

    <div
      v-else-if="status === 'success'"
      class="mx-auto max-w-md px-4 py-16 text-center"
    >
      <div
        class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/40"
      >
        <ImageOff class="size-6 text-muted-foreground" />
      </div>
      <h2 class="text-lg font-semibold">No photos yet</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Approved photos will appear here as they are shared.
      </p>
    </div>

    <p
      v-if="status === 'error'"
      class="mx-auto max-w-md px-4 py-16 text-center text-sm text-destructive"
    >
      {{ error?.message || "Could not load photos." }}
    </p>

    <div v-if="nextCursor" class="flex justify-center px-4 pb-6">
      <Button variant="outline" :disabled="loadingMore" @click="loadMore">
        <Loader2 v-if="loadingMore" class="animate-spin" />
        {{ loadingMore ? "Loading photos…" : "Load more photos" }}
      </Button>
    </div>
  </div>
</template>
