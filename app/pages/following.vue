<script setup lang="ts">
import { ref } from "vue";
import { Loader2, Users } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

definePageMeta({
  middleware: "auth",
});

useSeoMeta({
  title: "Following — Fotostash",
  robots: "noindex",
});

const filters = ref({ sort: "latest" });

const {
  photos,
  status,
  error,
  nextCursor,
  loadingMore,
  loadMoreError,
  loadMore,
} = await usePhotoFeed(filters, "/api/me/following-photos");
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Your feed
        </p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          Following
        </h1>
        <p class="mt-2 max-w-xl text-sm text-muted-foreground">
          The latest photos from photographers you follow.
        </p>
      </div>
      <Button variant="outline" as-child>
        <NuxtLink to="/search">Find photographers</NuxtLink>
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
        <Users class="size-6 text-muted-foreground" />
      </div>
      <h2 class="text-lg font-semibold">Your feed is quiet</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Follow photographers from their profile and their newest photos will
        appear here.
      </p>
      <Button variant="outline" class="mt-5" as-child>
        <NuxtLink to="/">Discover photos</NuxtLink>
      </Button>
    </div>

    <p
      v-if="error"
      class="mx-auto max-w-md py-16 text-center text-sm text-destructive"
    >
      {{ error.message || "Could not load your feed." }}
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
