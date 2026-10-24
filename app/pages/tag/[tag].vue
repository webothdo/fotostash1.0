<script setup lang="ts">
import { computed } from "vue";
import { ImageOff, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const route = useRoute();

const tag = computed(() =>
  String(route.params.tag ?? "")
    .trim()
    .toLowerCase()
);
const filters = computed(() => ({ tag: tag.value, sort: "latest" }));

const {
  photos,
  status,
  error,
  nextCursor,
  loadingMore,
  loadMoreError,
  loadMore,
} = await usePhotoFeed(filters);

const siteUrl = useSiteUrl();
const canonicalUrl = computed(
  () => `${siteUrl}/tag/${encodeURIComponent(tag.value)}`
);
const pageTitle = computed(() => `#${tag.value} photos — Fotostash`);
const pageDescription = computed(
  () => `Browse free ${tag.value} photos shared by photographers on Fotostash.`
);
const collectible = computed(() =>
  photos.value.slice(0, 12).map((photo) => ({
    "@type": "ImageObject" as const,
    name: photo.title ?? "Photo",
    contentUrl: photo.url,
    url: `${siteUrl}/photo/${photo.slug ?? photo.id}`,
  }))
);

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: "website",
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: collectible.value.length
    ? [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: pageTitle.value,
            description: pageDescription.value,
            url: canonicalUrl.value,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: collectible.value,
            },
          }).replace(/</g, "\\u003c"),
        },
      ]
    : [],
}));
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
    <nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-foreground">
        Browse
      </NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-foreground">#{{ tag }}</span>
    </nav>

    <header class="mt-4 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Tag
        </p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          #{{ tag }}
        </h1>
        <p class="mt-2 max-w-xl text-sm text-muted-foreground">
          Free photos tagged “{{ tag }}”. Download and use them in your next
          project.
        </p>
      </div>
      <Button variant="outline" as-child>
        <NuxtLink to="/search">Explore more photos</NuxtLink>
      </Button>
    </header>

    <MasonryLoadingComp
      v-if="status === 'pending' && photos.length === 0"
      class="mt-8"
    />

    <MasonryComp v-else-if="photos.length" :items="photos" class="mt-8" />

    <div
      v-else-if="status === 'success'"
      class="mx-auto max-w-md py-16 text-center"
    >
      <div
        class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/40"
      >
        <ImageOff class="size-6 text-muted-foreground" />
      </div>
      <h2 class="text-lg font-semibold">No photos with this tag yet</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        The tag may be new. Browse the full gallery for inspiration instead.
      </p>
      <Button variant="outline" class="mt-5" as-child>
        <NuxtLink to="/">Browse photos</NuxtLink>
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
