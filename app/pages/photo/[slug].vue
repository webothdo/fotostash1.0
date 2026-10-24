<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import Button from "@/components/ui/button/Button.vue";
import Avatar from "@/components/ui/avatar/Avatar.vue";
import { imageKitSrcSet, imageKitUrl } from "@/lib/imagekit";

const route = useRoute();
const slug = String(route.params.slug ?? "");
const { data, status, error }: any = await useFetch(`/api/photo/${slug}`, {
  lazy: true,
});

const photo = computed(() => data.value);

const siteUrl = useSiteUrl();
const canonicalUrl = computed(() => `${siteUrl}/photo/${slug}`);
const pageTitle = computed(() =>
  photo.value?.title ? `${photo.value.title} — Fotostash` : "Photo — Fotostash"
);
const pageDescription = computed(() => {
  if (photo.value?.description) return photo.value.description;

  const title = photo.value?.title || "A photo";
  const author = photo.value?.user?.username
    ? ` by @${photo.value.user.username}`
    : "";

  return `${title}${author} on Fotostash.`;
});
const ogImage = computed(() =>
  photo.value?.url ? imageKitUrl(photo.value.url, 1200) : undefined
);

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage,
  ogType: "article",
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
  twitterImage: ogImage,
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: photo.value
    ? [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageObject",
            name: photo.value.title ?? "Photo",
            description: photo.value.description ?? undefined,
            contentUrl: photo.value.url,
            thumbnailUrl: imageKitUrl(photo.value.url, 400),
            uploadDate: photo.value.createdAt ?? undefined,
            width: photo.value.width ?? undefined,
            height: photo.value.height ?? undefined,
            author: photo.value.user
              ? {
                  "@type": "Person",
                  name:
                    photo.value.user.name ||
                    photo.value.user.username ||
                    "Unknown author",
                  alternateName: photo.value.user.username
                    ? `@${photo.value.user.username}`
                    : undefined,
                  url: photo.value.user.username
                    ? `${siteUrl}/@${photo.value.user.username}`
                    : undefined,
                }
              : undefined,
          }).replace(/</g, "\\u003c"),
        },
      ]
    : [],
}));

const isLoading = ref(false);
async function downloadImage() {
  if (!photo.value?.url) return;
  try {
    isLoading.value = true;
    const response = await fetch(photo.value.url, { mode: "cors" });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = photo.value.title || "downloaded-image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    isLoading.value = false;
  } catch (e) {
    // fallback for browsers or CORS errors
    window.open(photo.value.url, "_blank");
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center py-8 px-2 bg-background">
    <div
      v-if="status === 'pending'"
      class="text-lg text-muted-foreground py-20"
    >
      Loading...
    </div>
    <div v-else-if="error" class="text-destructive py-20 text-center px-4">
      <p class="font-medium">Photo not found</p>
      <p class="mt-1 text-sm text-muted-foreground">
        It may have been removed or not approved yet.
      </p>
    </div>
    <Card
      v-else-if="photo"
      class="w-full min-h-[70vh] max-w-5xl flex flex-col md:flex-row p-0 overflow-hidden"
    >
      <!-- Image Section -->
      <div class="flex-1 flex items-center justify-center bg-muted p-4">
        <img
          :src="imageKitUrl(photo.url, 1600)"
          :srcset="imageKitSrcSet(photo.url)"
          sizes="(min-width: 768px) 55vw, 100vw"
          :width="photo.width ?? undefined"
          :height="photo.height ?? undefined"
          :alt="photo.title || 'Photo'"
          decoding="async"
          class="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
        />
      </div>
      <!-- Details Section -->
      <CardContent class="flex-1 flex flex-col justify-between gap-6 py-6">
        <div>
          <div
            v-if="photo.approved === false"
            class="mb-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium text-white"
            :class="photo.rejected ? 'bg-destructive' : 'bg-amber-500'"
          >
            {{ photo.rejected ? "Rejected" : "Pending review" }}
          </div>
          <h1 class="text-2xl font-bold mb-2">
            {{ photo.title || "Untitled Photo" }}
          </h1>
          <p class="text-muted-foreground mb-4" v-if="photo.description">
            {{ photo.description }}
          </p>
          <NuxtLink
            :to="`/@${photo.user?.username}`"
            class="flex items-center gap-3 mb-4 w-fit"
          >
            <Avatar>
              <span class="sr-only">{{ photo.user?.username }}</span>
              <span class="sr-only">View profile</span>
              <AvatarImage
                v-if="photo.user?.picture"
                :src="photo.user.picture"
                alt="Author avatar"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <div class="font-medium">
                {{
                  photo.user?.name || photo.user?.username || "Unknown Author"
                }}
              </div>
              <div class="text-xs text-muted-foreground">
                @{{ photo.user?.username }}
              </div>
            </div>
          </NuxtLink>
          <div
            v-if="photo.tags && photo.tags.length"
            class="flex flex-wrap gap-2 mb-4"
          >
            <NuxtLink
              v-for="tag in photo.tags"
              :key="tag"
              :to="`/tag/${encodeURIComponent(tag)}`"
              class="inline-block rounded-full bg-muted px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >#{{ tag }}</NuxtLink
            >
          </div>
        </div>
        <div class="flex flex-col gap-3 mt-8">
          <Button
            :disabled="isLoading"
            @click="downloadImage"
            class="w-full md:w-auto"
            >{{ isLoading ? "Downloading..." : "Download Free" }}</Button
          >
          <div class="text-xs text-muted-foreground mt-2">
            Free to use under Fotostash License
          </div>
          <div class="text-xs text-muted-foreground">
            Published on {{ useFormatDate(photo.createdAt) }}
          </div>
        </div>
      </CardContent>
    </Card>
    <div v-else class="text-lg text-muted-foreground py-20">
      No photo found.
    </div>
  </div>
</template>
