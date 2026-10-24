<script setup lang="ts">
import { computed } from "vue";
import { imageKitUrl } from "@/lib/imagekit";

definePageMeta({
  path: "/:username([@][\\w+\\-+]+)",
});

const route = useRoute();
const username = String(route.params.username ?? "");
const cleanedUsername = username.replace(/^@/, "");

const { data, status } = await useFetch(`/api/profile/${username}`);

const siteUrl = useSiteUrl();
const canonicalUrl = computed(() => `${siteUrl}/@${cleanedUsername}`);
const pageTitle = computed(() =>
  data.value?.name
    ? `${data.value.name} (@${cleanedUsername}) — Fotostash`
    : `@${cleanedUsername} — Fotostash`
);
const pageDescription = computed(
  () =>
    data.value?.bio ||
    `View photos shared by @${cleanedUsername} on Fotostash.`
);
const ogImage = computed(
  () => data.value?.picture || data.value?.photos?.[0]?.url || undefined
);

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage,
  ogType: "profile",
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
  twitterImage: ogImage,
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: data.value
    ? [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: data.value.name ?? `@${cleanedUsername}`,
            alternateName: `@${cleanedUsername}`,
            description: data.value.bio ?? undefined,
            image: data.value.picture ?? undefined,
            url: canonicalUrl.value,
          }).replace(/</g, "\\u003c"),
        },
      ]
    : [],
}));
</script>

<template>
  <div class="flex flex-col items-center min-h-screen bg-background">
    <Card
      class="w-full max-w-2xl mt-6 md:mt-8 mb-8 flex flex-col items-center p-8"
    >
      <Avatar class="h-[120px] w-[120px] mb-4">
        <AvatarImage
          v-if="data?.picture"
          :src="data?.picture"
          :alt="data?.name || username"
        />
        <AvatarFallback>{{ data?.name ? data.name[0] : "U" }}</AvatarFallback>
      </Avatar>
      <div class="flex flex-col items-center">
        <h2 class="text-2xl font-bold mb-1">
          {{ data?.name || cleanedUsername }}
        </h2>
        <div class="text-muted-foreground mb-1">@{{ cleanedUsername }}</div>
        <div
          v-if="data?.bio"
          class="text-center text-foreground/80 mb-2 max-w-md"
        >
          {{ data.bio }}
        </div>
        <div class="flex gap-6 mt-2 mb-2" v-if="data">
          <div class="flex flex-col items-center">
            <span class="font-semibold text-lg">{{
              data.approvedPhotoCount ?? data.photos?.length ?? 0
            }}</span>
            <span class="text-xs text-muted-foreground">Photos</span>
          </div>
          <div
            v-if="data.isOwner && data.pendingPhotoCount"
            class="flex flex-col items-center"
          >
            <span class="font-semibold text-lg">{{ data.pendingPhotoCount }}</span>
            <span class="text-xs text-muted-foreground">In review</span>
          </div>
        </div>
        <p
          v-if="data?.isOwner"
          class="mt-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
        >
          You are viewing your public profile. Pending photos are only visible
          to you.
        </p>
      </div>
    </Card>
    <section
      v-if="data?.collections?.length"
      class="mb-10 w-full max-w-5xl px-2"
    >
      <div class="mb-4 flex items-end justify-between gap-3">
        <h2 class="text-xl font-semibold">Collections</h2>
        <span class="text-xs text-muted-foreground">
          {{ data.collections.length }}
          {{ data.collections.length === 1 ? "collection" : "collections" }}
        </span>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="collection in data.collections"
          :key="collection.id"
          :to="`/collections/${collection.id}`"
          class="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="grid h-28 grid-cols-2 gap-0.5 bg-muted">
            <template v-if="collection.previewPhotos?.length">
              <img
                v-for="photo in collection.previewPhotos"
                :key="photo.id"
                :src="imageKitUrl(photo.url, 320)"
                :alt="photo.title || 'Collection photo'"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </template>
            <div
              v-else
              class="col-span-2 flex h-full items-center justify-center bg-gradient-to-br from-muted to-accent text-xs text-muted-foreground"
            >
              Empty collection
            </div>
          </div>
          <div class="p-3">
            <p class="truncate text-sm font-medium">{{ collection.name }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              {{ collection.photoCount }}
              {{ collection.photoCount === 1 ? "photo" : "photos" }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section id="user-images" class="w-full max-w-5xl">
      <MasonryLoadingComp v-if="status === 'pending'" />
      <MasonryComp v-if="status === 'success'" :items="data?.photos ?? []" />
      <div
        v-if="
          status === 'success' && (!data?.photos || data.photos.length === 0)
        "
        class="text-center text-muted-foreground py-12"
      >
        No photos yet.
      </div>
    </section>
  </div>
</template>
