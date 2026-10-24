<script setup lang="ts">
import { computed, ref } from "vue";
import {
  FolderPlus,
  Globe,
  Heart,
  Loader2,
  Lock,
  Plus,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import { imageKitUrl } from "@/lib/imagekit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Photo, PhotoPage } from "@/types/photo";

definePageMeta({
  middleware: "auth",
});

useSeoMeta({
  title: "Saved photos — Fotostash",
  robots: "noindex",
});

interface CollectionSummary {
  id: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  photoCount: number;
  previewPhotos: Photo[];
}

const {
  data: likesPage,
  status: likesStatus,
  error: likesError,
} = await useFetch<PhotoPage>("/api/me/likes", { lazy: true });

const {
  data: collections,
  status: collectionsStatus,
  refresh: refreshCollections,
} = await useFetch<CollectionSummary[]>("/api/me/collections", {
  lazy: true,
});

const extraLikes = ref<Photo[]>([]);
const nextCursor = ref<string | null>(null);
const loadingMore = ref(false);

watch(
  likesPage,
  (page) => {
    extraLikes.value = [];
    nextCursor.value = page?.nextCursor ?? null;
  },
  { immediate: true }
);

const likedPhotos = computed<Photo[]>(() => [
  ...(likesPage.value?.items ?? []),
  ...extraLikes.value,
]);

async function loadMoreLikes() {
  if (!nextCursor.value || loadingMore.value) return;
  loadingMore.value = true;

  try {
    const page = await $fetch<PhotoPage>("/api/me/likes", {
      query: { cursor: nextCursor.value },
    });
    extraLikes.value.push(...page.items);
    nextCursor.value = page.nextCursor;
  } catch (error) {
    toast.error("Could not load more photos", {
      description: (error as Error).message,
    });
  } finally {
    loadingMore.value = false;
  }
}

const showCreate = ref(false);
const newName = ref("");
const creating = ref(false);

async function createCollection() {
  const name = newName.value.trim();
  if (!name || creating.value) return;

  creating.value = true;

  try {
    await $fetch("/api/collections", {
      method: "POST",
      body: { name },
    });
    newName.value = "";
    showCreate.value = false;
    await refreshCollections();
    toast.success("Collection created", {
      description: "New collections are private by default.",
    });
  } catch (error) {
    toast.error("Could not create collection", {
      description: (error as Error).message,
    });
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Your library
        </p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Saved</h1>
        <p class="mt-2 max-w-xl text-sm text-muted-foreground">
          Photos you liked and collections you have put together.
        </p>
      </div>
      <Button @click="showCreate = !showCreate">
        <Plus class="size-4" />
        New collection
      </Button>
    </header>

    <form
      v-if="showCreate"
      class="mt-5 flex max-w-lg items-center gap-2 rounded-xl border bg-card p-3"
      @submit.prevent="createCollection"
    >
      <Input
        v-model="newName"
        placeholder="Collection name, e.g. Moodboard"
        maxlength="80"
        aria-label="Collection name"
        :disabled="creating"
      />
      <Button type="submit" :disabled="!newName.trim() || creating">
        <Loader2 v-if="creating" class="animate-spin" />
        Create
      </Button>
    </form>

    <section class="mt-10">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-xl font-semibold">Collections</h2>
        <span class="text-xs text-muted-foreground">
          {{ collections?.length ?? 0 }} total
        </span>
      </div>

      <div v-if="collectionsStatus === 'pending'" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-48 animate-pulse rounded-xl bg-muted" />
      </div>

      <div
        v-else-if="collections?.length"
        class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="collection in collections"
          :key="collection.id"
          :to="`/collections/${collection.id}`"
          class="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="grid h-36 grid-cols-2 gap-0.5 bg-muted">
            <template v-if="collection.previewPhotos.length">
              <img
                v-for="photo in collection.previewPhotos.slice(0, 4)"
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
              class="col-span-2 flex h-full items-center justify-center bg-gradient-to-br from-muted to-accent"
            >
              <FolderPlus class="size-7 text-muted-foreground" />
            </div>
          </div>
          <div class="flex items-start justify-between gap-2 p-4">
            <div class="min-w-0">
              <p class="truncate font-medium">{{ collection.name }}</p>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ collection.photoCount }}
                {{ collection.photoCount === 1 ? "photo" : "photos" }}
              </p>
            </div>
            <Lock
              v-if="collection.isPrivate"
              class="mt-1 size-4 shrink-0 text-muted-foreground"
              aria-label="Private collection"
            />
            <Globe
              v-else
              class="mt-1 size-4 shrink-0 text-muted-foreground"
              aria-label="Public collection"
            />
          </div>
        </NuxtLink>
      </div>

      <div
        v-else-if="collectionsStatus === 'success'"
        class="mt-4 rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center"
      >
        <FolderPlus class="mx-auto size-7 text-muted-foreground" />
        <p class="mt-2 font-medium">No collections yet</p>
        <p class="mt-1 text-sm text-muted-foreground">
          Create a collection, then save photos from any photo page.
        </p>
      </div>
    </section>

    <section class="mt-12">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-xl font-semibold">Liked photos</h2>
        <span class="text-xs text-muted-foreground">
          {{ likedPhotos.length }} shown
        </span>
      </div>

      <MasonryLoadingComp
        v-if="likesStatus === 'pending' && likedPhotos.length === 0"
      />

      <MasonryComp v-else-if="likedPhotos.length" :items="likedPhotos" />

      <div
        v-else-if="likesStatus === 'success'"
        class="mt-4 rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center"
      >
        <Heart class="mx-auto size-7 text-muted-foreground" />
        <p class="mt-2 font-medium">No liked photos yet</p>
        <p class="mt-1 text-sm text-muted-foreground">
          Tap the heart on a photo to keep it here.
        </p>
        <Button variant="outline" class="mt-4" as-child>
          <NuxtLink to="/">Browse photos</NuxtLink>
        </Button>
      </div>

      <p v-if="likesError" class="py-10 text-center text-sm text-destructive">
        {{ likesError.message || "Could not load liked photos." }}
      </p>

      <div v-if="nextCursor" class="mt-4 flex justify-center">
        <Button variant="outline" :disabled="loadingMore" @click="loadMoreLikes">
          <Loader2 v-if="loadingMore" class="animate-spin" />
          {{ loadingMore ? "Loading…" : "Load more liked photos" }}
        </Button>
      </div>
    </section>
  </div>
</template>
